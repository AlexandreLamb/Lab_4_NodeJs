import { expect } from 'chai'
import { Metric, MetricsHandler } from './metrics'
import { LevelDB } from "./leveldb"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler

describe('Metrics', function () {
  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  after(function () {
    dbMet.db.close()
  })
  describe('#get', function () {
    it('should get empty array on non existing group', function () {
      dbMet.getOne("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
  })
  describe('#save',function(){
      it('should save metrics',function(){
          dbMet.saveOne("a@a:a",new Metric("z",4),function (err: Error | null) {
            expect(err).to.be.undefined
          })
        })
      })
    describe('#delete',function(){
        it('should delete metrics',function(){
            dbMet.delete("a@a",function (err: Error | null,result: Boolean) {
            expect(result).to.be.eq(true)
            })
          })
        })
    describe('#delete',function(){
            it('should delete metrics',function(){
                dbMet.delete("a@a",function (err: Error | null,result: Boolean) {
                expect(result).to.be.eq(false)
                })
              })
            })
  })