"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
const ts_md5_1 = require("ts-md5");
const logger_1 = require("../logger");
class Strategy {
    uri;
    parameters;
    constructor(parameters) {
        this.parameters = parameters;
        this.uri = ts_md5_1.Md5.hashAsciiStr(JSON.stringify(parameters));
    }
    logStatus(status) {
        logger_1.logger.info({
            uri: this.uri,
            data: status,
        }, 'strategy status');
    }
}
exports.Strategy = Strategy;
