import {LevelDB} from './leveldb';
import WriteStream from 'level-ws'
import { METHODS } from 'http';

export class Metric {
  public timestamp: string
  public value: number

  constructor(ts: string, v: number) {
    this.timestamp = ts
    this.value = v
  }
}

export class MetricsHandler {
  public db: any 

  constructor(dbPath: string) {
    this.db = LevelDB.open(dbPath)
  }
  public save(key: string, metrics: Metric[], callback: (error: Error | null) => void) {
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    metrics.forEach((m: Metric) => {
      stream.write({ key: `metric:${key}:${m.timestamp}`, value: m.value })
    })
    stream.end()
  }
  public saveOne(key: string, metric: Metric, callback: (error: Error | null) => void) {
    console.log("key : "+key)
    const stream = WriteStream(this.db)
    stream.on('error', callback)
    stream.on('close', callback)
    stream.write({ key: `metric:${key}:${metric.timestamp}`, value: metric.value })
    stream.on('end',function(error){
      callback(error)
    })
  }
  
  public delete(key: string, callback: (error: Error | null, result : Boolean) => void) {
    let db = this.db
    let isDel : Boolean = false
    this.db.createReadStream()
  .on('data', function (data) {
    const name = data.key.split(':')[1];
    console.log(name + " " + key)
   if ( name == key){
    db.del(data.key,function(err){
      if(err){
        callback(err,false)
      }
    })
    isDel = true
  }
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
    callback(err,false)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
    callback(null,isDel)
  })
  }

  public getOne(key:string,callback: (error: Error | null, result :any) => void){
    let metrics: Metric[] = []
    console.log(key)
    this.db.createReadStream()
  .on('data', function (data) {
    const name = data.key.split(':')[1]+":"+data.key.split(':')[2];
   if ( name == key){
    const timestamp = data.key.split(':')[3];
    let metric : Metric = new Metric(timestamp, data.value)
    metrics.push(metric)
   }
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
    callback(err,null)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
    callback(null,metrics)
  })

  }

  public getAll(email:string ,callback: (error: Error | null, result :any) => void){
    let metrics: Metric[] = []
    this.db.createReadStream()
  .on('data', function (data) {
    const emailData = data.key.split(':')[1];
    if( email == emailData ){
      const timestamp = data.key.split(':')[3];
      let metric : Metric = new Metric(timestamp, data.value)
      metrics.push(metric)
    }
    
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
    callback(err,null)
  })
  .on('close', function () {
    console.log('Stream closed')
  })
  .on('end', function () {
    console.log('Stream ended')
    callback(null,metrics)
  })
  }
}
