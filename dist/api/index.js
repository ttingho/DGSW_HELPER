"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const neis = __importStar(require("../lib/neis"));
const moment_1 = __importDefault(require("moment"));
const apiRouter = express_1.Router();
const today = moment_1.default(new Date()).format('YYYYMMDD');
const tomorrow = moment_1.default(new Date().setDate(new Date().getDate() + 1)).format('YYYYMMDD');
apiRouter.post('/today-meal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const breakfastToday = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 1, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    const lunchToday = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 2, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    const dinnerToday = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 3, today))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    return res.send({
        version: '2.0',
        data: {
            breakfast: breakfastToday,
            lunch: lunchToday,
            dinner: dinnerToday
        }
    });
}));
apiRouter.post('/tomorrow-meal', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const breakfastTomorrow = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 1, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    const lunchTomorrow = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 2, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    const dinnerTomorrow = (yield neis.getMealByDate(process.env.SCHOOLCODE, process.env.OFCDC, 3, tomorrow))[0].DDISH_NM.replace(/<br\s*\/?>/mg, '\n');
    return res.send({
        version: '2.0',
        data: {
            breakfast: breakfastTomorrow,
            lunch: lunchTomorrow,
            dinner: dinnerTomorrow
        }
    });
}));
apiRouter.post('/today-schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleToday = yield neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, today, today);
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
    const itemList = [];
    for (const data in scheduleToday) {
        itemList.push({
            title: scheduleToday[data].name,
            description: moment_1.default(scheduleToday[data].startDate).format('YYYY-MM-DD')
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
}));
apiRouter.post('/tomorrow-schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const scheduleTomorrow = yield neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, tomorrow, tomorrow);
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
    const itemList = [];
    for (const data in scheduleTomorrow) {
        itemList.push({
            title: scheduleTomorrow[data].name,
            description: moment_1.default(scheduleTomorrow[data].startDate).format('YYYY-MM-DD')
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
}));
apiRouter.post('/schedule', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield neis.getSchedule(process.env.SCHOOLCODE, process.env.OFCDC, moment_1.default(tomorrow).format('YYYYMMDD'), moment_1.default(`${new Date().getFullYear()}-12-31`).format('YYYYMMDD'));
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
    const itemList = [];
    console.log('object');
    for (const data in schedule) {
        itemList.push({
            title: schedule[data].name,
            description: moment_1.default(schedule[data].startDate).format('YYYY-MM-DD')
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
}));
exports.default = apiRouter;
//# sourceMappingURL=index.js.map