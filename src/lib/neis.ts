/* eslint-disable no-useless-catch */
import DotEnv from 'dotenv';
import request from 'request-promise-native';
import moment from 'moment';

DotEnv.config();

const neis = process.env.TOKEN;

/**
 * @author 전광용 <jeon@kakao.com>
 * @description NEIS 설정 확인
 */
function configCheck() {
  if (!neis) {
    throw new Error('NEIS 설정이 되어있지 않습니다.');
  }
}


/**
 * @author 전광용 <jeon@kakao.com>
 * @description NEIS 에서 학교 정보를 불러옵니다.
 * @param {String} ofcdcCode 관할 교육청 코드
 * @param {String} schoolName 학교이름
 * @returns {Object} 학교 검색 결과
 */
export const getSchoolInfo = async (ofcdcCode, schoolName) => {
  // 설정 확인
  configCheck();

  try {
    const { result } = await request({
      uri: 'https://open.neis.go.kr/hub/schoolInfo',
      method: 'GET',
      resolveWithFullResponse: true,
      qs: {
        KEY: neis,
        Type: 'json',
        ATPT_OFCDC_SC_CODE: ofcdcCode,
        SCHUL_NM: schoolName,
      },
      json: true,
    });

    const data = JSON.parse(result);
    console.log(data);

    try {
      return result.schoolInfo[1].row[0];
    } catch (error) {
      console.log('[NEIS] 학교 정보가 없음');
      return null;
    }
  } catch (error) {
    console.log(`[NEIS] 학교 정보 조회 중 오류:\n${error}`);
    throw error;
  }
};

/**
 * @author 전광용 <jeon@kakao.com>
 * @description 확교 급식을 조회합니다.
 * @param {Object} param 검색 설정
 * @returns {Object} 학교 급식
 */
export const getMeal = async (schoolCode, ofcdcCode, mealCode, startDate, endDate) => {
  // 설정 확인
  configCheck();
  
  const option = {
    uri: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
    method: 'GET',
    qs: {
      KEY: neis,
      Type: 'json',
      pIndex: 1,
      pSize: 1000,
      ATPT_OFCDC_SC_CODE: ofcdcCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: startDate,
      MLSV_TO_YMD: endDate,
      MMEAL_SC_CODE: mealCode,
    },
  };

  try {
    const data = await request(option);
    const result = JSON.parse(data);
    
    if (!result.mealServiceDietInfo) {
      if (result.RESULT.CODE === 'INFO-200') {
        return [];
      }
    }

    try {
      return result.mealServiceDietInfo[1].row;
    } catch (error) {
      console.log(`[NEIS] 급식 정보가 없음\n${error}`);
      return null;
    }
  } catch (error) {
    console.log(`[NEIS] 급식 조회 중 오류:\n${error}`);
    throw error;
  }
};

/**
 * @author 전광용 <jeon@kakao.com>
 * @description 학교 학사 일정을 불러옵니다.
 * @param {String} schoolCode 학교코드
 * @param {String} ofcdcCode 관할 교육청 코드
 * @param {String} startDate 검색 시작 일자 (YYYYMMDD)
 * @param {String} endDate 검색 종료 일자 (YYYYMMDD)
 * @returns {Object} 학교 학사 일정
 */
export const getSchedule = async (schoolCode, ofcdcCode, startDate, endDate) => {
  // 설정 확인
  configCheck();

  try {
    //
    let result = await request.get(`https://open.neis.go.kr/hub/SchoolSchedule?ATPT_OFCDC_SC_CODE=${ofcdcCode}&SD_SCHUL_CODE=${schoolCode}&Type=JSON&KEY=${neis}&pSize=1000&pIndex=1&AA_FROM_YMD=${startDate}&AA_TO_YMD=${endDate}`);
    
    result = JSON.parse(result);

    if (!result.SchoolSchedule) {
      return null;
    }

    const schoolSchedule = result.SchoolSchedule[1].row;

    if (!Array.isArray(schoolSchedule)) {
      return null;
    }

    const retVal = [];

    for (let index = 0; index < schoolSchedule.length; index += 1) {
      const schdeuleRespObject = schoolSchedule[index];

      const scheduleObject = {
        name: String(schdeuleRespObject.EVENT_NM).replace(/\s/g, ''),
        startDate: moment(schdeuleRespObject.AA_YMD, 'YYYYMMDD').startOf('day').toDate(),
        endDate: moment(schdeuleRespObject.AA_YMD, 'YYYYMMDD').endOf('day').toDate(),
        target: [],
      };

      if (schdeuleRespObject.ONE_GRADE_EVENT_YN === 'Y') {
        scheduleObject.target.push('1학년');
      }
      
      if (schdeuleRespObject.TW_GRADE_EVENT_YN === 'Y') {
        scheduleObject.target.push('2학년');
      }

      if (schdeuleRespObject.THREE_GRADE_EVENT_YN === 'Y') {
        scheduleObject.target.push('3학년');
      }

      // 일정 추가
      retVal.push(scheduleObject);
    }

    return retVal;
  } catch (error) {
    console.log(`[NEIS] 학사 일정 조회 중 오류:\n${error}`);
    throw error;
  }
};

export const getMealByDate = async (schoolCode, ofcdcCode, mealCode, date) => {
  // 설정 확인;
  configCheck();

  const option = {
    uri: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
    method: 'GET',
    qs: {
      KEY: neis,
      Type: 'json',
      pIndex: 1,
      pSize: 1000,
      ATPT_OFCDC_SC_CODE: ofcdcCode,
      SD_SCHUL_CODE: schoolCode,
      MLSV_FROM_YMD: date,
      MLSV_TO_YMD: date,
      MMEAL_SC_CODE: mealCode,
    },
  };

  try {
    const data = await request(option);
    const result = JSON.parse(data);

    if (result.mealServiceDietInfo) {
      if (!result.mealServiceDietInfo[1]) {
        return [];
      }
    
      if (!result.mealServiceDietInfo[1].row) {
        return [];
      }

      return result.mealServiceDietInfo[1].row;
    }


    if (result.RESULT.CODE === 'INFO-200' && !result.mealServiceDietInfo) {
      return [];
    }
  } catch (error) {
    throw error;
  } 
};
