import { 
    log, 
    access, 
    warn, 
    debug, 
    system, 
    database, 
    event, 
    info, 
    error, 
    fatal, 
    readLog, 
    getResourceId, 
    getTraceId, 
    getSpanId, 
    getCommit 
} from './logger.js';

const issue = new Error();

issue.message = " There was an Error ";

// log({
//     level: 'error', 
//     message: issue,
//     "resourceId": getResourceId(),
//     "traceId": getTraceId(),
//     "spanId": getSpanId(),
//     "commitId": getCommit(),
// });

// log({ level: 'error', error: issue });

// log({ level: 'fatal', error: issue });

// error(issue)
// fatal(issue)
// event('Welcome')
// database('connection failed')
// warn('Warning');
// system('System')

// readLog('error.log').then((data)=>{
//     console.log(data);
// })
import express from 'express';
import bodyParser from 'body-parser';
import { dbConnection } from './mongo.js';
import Log from './model/Log.js';

const app = express();
const port = 3000;
dbConnection();
// Middleware for parsing JSON in request body
app.use(bodyParser.json());

// routes fo generating logs
app.post('/logs', (req, res) => {
    const level = req.body.level;
    const message = req.body.message;
    const resourceId = req.body.resourceId;
    const traceId = req.body.traceId;
    const spanId = req.body.spanId;
    const commit = req.body.commit;
    if (level === 'error') {
        error(message, resourceId, traceId, spanId, commit);
        return res.send('success');
    }
    return res.send("failure");
});

app.post('/logs/insert', (req, res) => {
    readLog('error.log').then(async (data) => {
        // insert into mongo db 
        const docs = await Log.insertMany(data);
        return res.send({ docs: docs })
    })
})
app.get('/search', async (req, res) => {
    const { level, message, resourceId, traceId, spanId, commit, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    const skip = (pageNumber - 1) * limitNumber;


    const query = {};
    if (level) query.level = level;
    if (message) query.message = { $regex: message, $options: 'i' }; // Case-insensitive search
    if (resourceId) query.resourceId = resourceId;
    if (traceId) query.traceId = traceId;
    if (spanId) query.spanId = spanId;
    if (commit) query.commit = commit;

    // Execute the query with pagination
    const logs = await Log.find(query)
        .skip(skip)
        .limit(limitNumber)
        .exec();

    return res.send({ result: logs });
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
