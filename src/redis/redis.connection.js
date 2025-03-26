import Redis from "ioredis";

const redis = new Redis({
    host:'localhost',
    port: 6379
});

redis.on("connect",()=>console.log("Connected To Redis!"));
redis.on("error",(err)=>console.error("Redis Error:",err));

export const testRedis = async()=>{
    try {
        await redis.set('testKey', 'Hello, Redis!');
        const value = await redis.get('testKey');
        console.log('Redis Connection Successful! Retrieved value:', value);
    } catch (error) {
        console.error('Redis Connection Failed:', error);
    } finally {
        redis.quit(); 
    }
}
export default redis;
