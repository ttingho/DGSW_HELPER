import { Router } from 'express';
import * as neis from '../lib/neis';
import moment from 'moment';

const apiRouter = Router();

const today = moment(new Date()).format('YYYYMMDD');
const tomorrow = moment(new Date().setDate(new Date().getDate() + 1)).format('YYYYMMDD');

interface IObject {
  name: string,
  startDate: string,
}

apiRouter.post('/today-meal', async (req, res) => {
  const breakfastToday = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 1, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
  const lunchToday = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 2, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
  const dinnerToday = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 3, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');

  return res.send({
    version: '2.0',
    data: {
      breakfast: breakfastToday,
      lunch: lunchToday,
      dinner: dinnerToday
    }
  });
});

apiRouter.post('/tomorrow-meal', async (req, res) => {
  const breakfastTomorrow = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 1, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
  const lunchTomorrow = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 2, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
  const dinnerTomorrow = (await neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 3, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
  
  return res.send({
    version: '2.0',
    data: {
      breakfast: breakfastTomorrow,
      lunch: lunchTomorrow,
      dinner: dinnerTomorrow
    }
  });
});

apiRouter.post('/today-schedule', async (req, res) => {
  const scheduleToday = await neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, today, today);

  if (scheduleToday === null) {
    return res.send({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '오늘의 일정이 없습니다.'
            }
          }
        ]
      }
    });
  }

  const itemList:Array<Object> = [];

  for (const data in scheduleToday) {
    itemList.push({
      title: scheduleToday[data].name,
      description: moment(scheduleToday[data].startDate).format('YYYY-MM-DD')
    });
  }

  return res.send({
    version: '2.0',
    template: {
      outputs: [
        {
          listCard: {
            header: {
              title: '오늘의 일정!'
            },
            items: itemList
          }
        }
      ]
    }
  });
});

apiRouter.post('/tomorrow-schedule', async (req, res) => {
  const scheduleTomorrow = await neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, tomorrow, tomorrow);

  if (scheduleTomorrow === null) {
    return res.send({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '내일의 일정이 없습니다.'
            }
          }
        ]
      }
    });
  }

  const itemList:Array<Object> = [];

  for (const data in scheduleTomorrow) {
    itemList.push({
      title: scheduleTomorrow[data].name,
      description: moment(scheduleTomorrow[data].startDate).format('YYYY-MM-DD')
    });
  }

  return res.send({
    version: '2.0',
    template: {
      outputs: [
        {
          listCard: {
            header: {
              title: '내일의 일정!'
            },
            items: itemList
          }
        }
      ]
    }
  });
});

apiRouter.post('/schedule', async (req, res) => {
  const schedule:Array<IObject> = await neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, moment(tomorrow).format('YYYYMMDD'), moment(`${new Date().getFullYear()}-12-31`).format('YYYYMMDD'));

  // console.log(schedule);

  if (schedule === null) {
    return res.send({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '일정이 없습니다.'
            }
          }
        ]
      }
    });
  }

  const itemList:Array<Object> = [];

  console.log('object');

  for (const data in schedule) {
    itemList.push({
      title: schedule[data].name,
      description: moment(schedule[data].startDate).format('YYYY-MM-DD')
    });
  }

  console.log(itemList);

  return res.send({
    version: '2.0',
    template: {
      outputs: [
        {
          listCard: {
            header: {
              title: '남은 일정!'
            },
            items: itemList.splice(0, 5)
          }
        }
      ]
    }
  });
});

export default apiRouter;
