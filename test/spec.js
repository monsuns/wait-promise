'use strict'

var expect = require('chai').expect;

describe('wait-promise', function(){
  describe('normal cases', function(){
    this.timeout(5000);
    let wait = require('../src/wait-promise');

    it('wait object', function(){
      expect(wait).to.be.a('object');
    });

    it('wait after', function(){
      let i = 0;
      setTimeout(function(){
        i++;
      }, 100);
      expect(i).to.equal(0);
      return wait.after(300).check(function(){
        expect(i).to.equal(1);
      });
    });

    it('wait until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.until(function(){
        if(i >= 10) {clearInterval(timer)};
        expect(i).to.be.above(10);
      });
    });

    it('wait before until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      let p = wait.before(200).until(function(){
        return i >= 10;
      });    
      return p.catch(function(){
        clearInterval(timer);
        expect(i).to.be.below(10);
      });        
    });

    it('wait after until', function(){
      let i = 0, j = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.after(600).until(function(){
        return j++ > 5;
      }).then(function(){
        clearInterval(timer);
        expect(j).to.above(5);
        expect(i).to.above(15);
      });      
    });

    it('wait every until', function(){
      let i = 0;
      let timer = setInterval(function(){
        i++;
      }, 10);
      return wait.every(500).until(function(){
        return i > 10;
      }).then(function(){
        clearInterval(timer);
        expect(i).to.above(40);
      });
    });

    it('wait after check', function(){
      let i = 0, j = 0;
      let timer = setInterval(function(){
        i++;
      }, 50);
      return wait.after(600).check(function(){
        return i > 50;
      }).catch(function(){
        expect(i).to.above(10);
        expect(i).to.below(50);
      });
    });
  });

  describe('async cases', function(){
    this.timeout(5000);
    let {until, sleep, every, before, after} = require('../src/wait-promise');   
  
    it('await until', async function(){
      let i = 0;
      await until(() => ++i >= 5);
      expect(i).to.equal(5);

      i = 0;
      await every(10).until(() => ++i >= 50);
      expect(i).to.equal(50);
    });

    it('await sleep', async function(){
      let t = Date.now();
      await sleep(500);
      expect(Date.now() - t).to.be.above(499);
    });

    it('await before until', async function(){
      let i = 0;
      async function test(){
        await every(10).before(100).until(() => ++i > 20);
      }
      return test().catch((e) => {
        expect(e.message).to.equal('time out');
      });
    });
  });
});