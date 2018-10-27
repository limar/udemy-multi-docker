const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index){
    if(index == 0){
        return 0;
    }

    if(index == 1){
        return 1;
    }

    prev0 = 0;
    prev1 = 1
    for(i = 2; i<= index; i ++){
        ret = prev0 + prev1;
        prev0 = prev1;
        prev1 = ret;
    }

    return ret;
}

sub.on("message",(channel, message) => {
    redisClient.hset("values", message, fib(parseInt(message)));
});

sub.subscribe("insert");

module.exports = fib;
