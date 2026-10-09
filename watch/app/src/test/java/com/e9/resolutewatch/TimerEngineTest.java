package com.e9.resolutewatch;
import org.junit.Test;
import static org.junit.Assert.*;
public class TimerEngineTest {
    @Test public void penaltiesWaitForArmingAndMaster(){TimerEngine t=new TimerEngine();t.setPenalty(0,30000);t.toggleGame();t.advance(1000);assertEquals(30000,t.penalties[0]);t.togglePenalties();t.advance(1000);assertEquals(29000,t.penalties[0]);t.toggleGame();t.advance(5000);assertEquals(29000,t.penalties[0]);}
    @Test public void alertsAtSixtyTenAndZero(){TimerEngine t=new TimerEngine();t.running=true;t.remaining=60500;assertTrue((t.advance(600)&TimerEngine.MINUTE)!=0);assertEquals(0,t.advance(100));t.remaining=10500;assertTrue((t.advance(600)&TimerEngine.BEEP)!=0);t.remaining=500;assertTrue((t.advance(600)&TimerEngine.GAME_END)!=0);assertFalse(t.running);}
    @Test public void penaltyZeroAndGameBoundary(){TimerEngine t=new TimerEngine();t.running=true;t.remaining=500;t.setPenalty(0,1500);t.togglePenalties();t.advance(5000);assertEquals(1000,t.penalties[0]);t.remaining=5000;t.running=true;assertTrue((t.advance(1000)&TimerEngine.PENALTY_END)!=0);}
    @Test public void controls(){TimerEngine t=new TimerEngine();t.remaining=0;t.adjust(-1000);assertEquals(0,t.remaining);t.adjust(1000);assertEquals(1000,t.remaining);assertFalse(t.running);t.resetGame();assertEquals(480000,t.remaining);t.next(1);assertEquals(2,t.period);t.setPenalty(0,30000);t.addPenalty(0,5000);assertEquals(35000,t.penalties[0]);t.togglePenalties();t.togglePenalties();assertFalse(t.anyArmed());}
}
