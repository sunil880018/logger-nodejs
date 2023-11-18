import path from 'path';
import chalk from 'chalk';
import moment from 'moment';
import { existsSync, mkdirSync, appendFileSync, createReadStream } from 'fs';
import readline from 'readline';
import config from './config.js'

import randomNumberGenerate from 'random-number';
import { uuid } from 'uuidv4';


/**
 * main logging function 
 * @param {object} options 
 * Object { level, message, resourceId, traceId, spanId, commitId, error }
 */
export const log = (options) => {
    const levelName = getLevelName(options.level);
    let message = options.message ? options.message : 'UnIdentified Error';
    const error = options.error ? options.error : null;
    const resourceId = options.resourceId ? options.resourceId : "";
    const traceId = options.traceId ? options.traceId : "";
    const spanId = options.spanId ? options.spanId : "";
    const commitId = options.commitId ? options.commitId : "";

    // Always log to the console
    writeToConsole(levelName, message, resourceId, traceId, spanId, commitId, error);
    if (config.levels[levelName].writeToFile) {
        writeToFile(levelName, message, resourceId, traceId, spanId, commitId);
    }
}



/**
 * write formatted message to the console
 * @param {string} levelName 
 * @param {string} message 
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId
 * @param {Error|null} error 
 */
const writeToConsole = (levelName, message, resourceId = "", traceId = "", spanId = "", commitId = "", error = null) => {
    const level = config.levels[levelName];

    let chalkFunction = null;
    if (level.color.includes('#')) {
        chalkFunction = chalk.hex(level.color);
    } else if (Array.isArray(level.color)) {
        if (level.color.length === 3) {
            chalkFunction = chalk.rgb(level.color[0], level.color[1], level.color[2]);
        } else {
            throw new Error(
                `We have detected that the configuration for the logger level ${chalk.red(`${levelName.toUpperCase()}`)}
                is set for RGB but only has ${chalk.red(`${level.color.length}`)}
                values.\nThe configuration must be an ${chalk.red(`array`)} and contain ${chalk.red('3')} values.`
            )
        }

    } else {
        chalkFunction = chalk[level.color];
    }
    message = error ? `${chalkFunction(`${error.message} \n ${error.stack}`)}` : message;
    const header = `[${levelName.toUpperCase()}][${getFormattedCurrentDate()}]`
    console.log(`${chalkFunction(header)} : ${chalkFunction(message)} ${chalkFunction(resourceId)} ${chalkFunction(traceId)} ${chalkFunction(spanId)} ${chalkFunction(commitId)}`)
}


/**
 * 
 * @param {string} levelName 
 * @param {string} message 
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId
 */
const writeToFile = (level, message, resourceId = "", traceId = "", spanId = "", commitId = "") => {
    const logsDir = './logs';

    const data = `{"level":"${level.toUpperCase()}", "message":"${message}", "timestamp":"${getFormattedCurrentDate()}", "resourceId":"${resourceId}", "traceId":"${traceId}", "spanId":"${spanId}","commit":"${commitId}"}\n`;

    if (!existsSync(logsDir)) {
        mkdirSync(logsDir);
    }

    const options = {
        encoding: 'utf8',
        mode: 438
    }

    appendFileSync(`./logs/${level}.log`, data, options);
}


/**
 * read data from a log
 * @param {string} filename 
 * @returns Promise
 */
export const readLog = async (fileName = null) => {
    const logsDir = './logs';
    return new Promise((resolve, reject) => {

        const file = path.join(logsDir, fileName.includes('.') ? fileName : `${fileName}.log`);

        const lineReader = readline.createInterface({
            input: createReadStream(file)
        });

        const logs = [];

        lineReader.on('line', (line) => {
            logs.push(JSON.parse(line));
        });

        lineReader.on('close', () => {
            console.log(chalk.yellow(`${fileName.toUpperCase()} logs has been accessed.`));
            console.table(logs);

            resolve(logs);
        });


        lineReader.on('error', (error) => {
            reject(error);
        })


    })
}


/**
 * Get level name
 * @param {string} level 
 * @returns 
 */
const getLevelName = (level) => {
    return level && config.levels.hasOwnProperty(level) ? level : 'info';
}



/**
 * Get formmatted date
 * @returns string 
 */
const getFormattedCurrentDate = () => {
    return moment(new Date()).format(moment.HTML5_FMT.DATETIME_LOCAL_SECONDS);
}


/**
 * 
 * @param {string} id 
 * @returns string
 */
export const getResourceId = (id) => {
    const randomNumber = `server-${randomNumberGenerate({ min: 1000, max: 999999999, integer: true })}`
    return id ? id : randomNumber;
}

/**
 * 
 * @param {string} id 
 * @returns string
 */
export const getTraceId = (id) => {
    const randomNumber = `abc-xyz-${randomNumberGenerate({ min: 1000, max: 999999999, integer: true })}`
    return id ? id : randomNumber;
}

/**
 * 
 * @param {string} id 
 * @returns string
 */
export const getSpanId = (id) => {
    const randomNumber = `span-${randomNumberGenerate({ min: 1000, max: 999999999, integer: true })}`
    return id ? id : randomNumber;
}


/**
 * 
 * @param {string} commitId 
 * @returns 
 */
export const getCommit = (commitId) => {
    const id = uuid();
    return commitId ? commitId : id;
}
/**
 * Helper function for printing ACCESS level logs
 * @param {string} message
 */
export const access = (message) => {
    log({ level: 'access', message })
}

/**
 * Helper function for printing WARN level logs
 * @param {string} message 
 */
export const warn = (message) => {
    log({ level: 'warn', message })
}

/**
 * Helper function for printing DEBUG level logs
 * @param {string} message 
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId
 */
export const debug = (message, resourceId, traceId, spanId, commitId) => {
    log({ level: 'debug', message, resourceId, traceId, spanId, commitId })
}

/**
 * Helper function for printing SYSTEM level logs
 * @param {string} message
 */
export const system = (message) => {
    log({ level: 'system', message })
}

/**
 * Helper function for printing DATABASE level logs
 * @param {string} message 
 */
export const database = (message) => {
    log({ level: 'database', message })
}


/**
 * Helper function for printing EVENT level logs
 * @param {string} message 
 */
export const event = (message) => {
    log({ level: 'event', message })
}

/**
 * Helper function for printing INFO level logs
 * @param {string} message
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId 
 */
export const info = (message, resourceId, traceId, spanId, commitId) => {
    log({ level: 'info', message, resourceId, traceId, spanId, commitId })
}

/**
 * Helper function for printing ERROR level logs
 * @param {string|Error} message 
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId
 */
export const error = (error, resourceId, traceId, spanId, commitId) => {
    if (typeof error === 'string') {
        log({ level: 'error', message: error, resourceId, traceId, spanId, commitId })
    } else {
        log({ level: 'error', error: error })
    }

}

/**
 * Helper function for printing FATAL level logs
 * @param {string} message 
 * @param {string} resourceId
 * @param {string} traceId
 * @param {string} spanId
 * @param {string} commitId
 */
export const fatal = (error, resourceId, traceId, spanId, commitId) => {
    if (typeof error === 'string') {
        log({ level: 'fatal', message: error, resourceId, traceId, spanId, commitId })
    } else {
        log({ level: 'fatal', error: error })
    }

}