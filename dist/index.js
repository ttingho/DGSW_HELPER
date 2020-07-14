"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const api_1 = __importDefault(require("./api"));
dotenv_1.default.config();
const app = express_1.default();
app.use(body_parser_1.default());
app.use('/api', api_1.default);
app.listen(3000, () => {
    console.log('3000port');
});
//# sourceMappingURL=index.js.map