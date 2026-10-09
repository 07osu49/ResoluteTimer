package com.e9.resolutewatch;

/** Millisecond clocks; Android-independent for unit tests. */
public final class TimerEngine {
    public int periods=4, minutes=8, period=1;
    public long remaining=480000;
    public boolean running=false;
    public final long[] penalties=new long[4];
    public final boolean[] armed=new boolean[4];
    public static final int BEEP=1, PENALTY_END=2, MINUTE=4, GAME_END=8;
    public int advance(long elapsed) {
        if(!running || elapsed<=0) return 0;
        long before=remaining, gameElapsed=Math.min(elapsed,before);
        remaining=Math.max(0,before-elapsed);
        int events=countdown(before,remaining);
        if(before>60000 && remaining<=60000 && remaining>0) events|=MINUTE;
        if(before>0 && remaining==0) events|=GAME_END;
        for(int i=0;i<4;i++) if(armed[i] && penalties[i]>0) {
            long p=penalties[i]; penalties[i]=Math.max(0,p-gameElapsed);
            events|=countdown(p,penalties[i]);
            if(penalties[i]==0) events|=PENALTY_END;
        }
        if(remaining==0) running=false;
        return events;
    }
    private int countdown(long a,long b) {
        long before=(a+999)/1000, after=(b+999)/1000;
        return before>after && after>0 && after<=10 ? BEEP:0;
    }
    public void toggleGame(){if(!running && remaining==0)remaining=minutes*60000L;running=!running;}
    public void adjust(long delta){remaining=Math.max(0,remaining+delta);if(remaining==0)running=false;}
    public void resetGame(){running=false;remaining=minutes*60000L;}
    public void next(int direction){period=Math.max(1,Math.min(periods,period+direction));resetGame();}
    public void setPenalty(int i,long time){penalties[i]=time;armed[i]=false;}
    public void addPenalty(int i,long time){if(penalties[i]==0)armed[i]=false;penalties[i]+=time;}
    public boolean anyArmed(){for(int i=0;i<4;i++)if(armed[i]&&penalties[i]>0)return true;return false;}
    public void togglePenalties(){boolean enable=!anyArmed();for(int i=0;i<4;i++)armed[i]=enable&&penalties[i]>0;}
    public static String format(long ms){long sec=(Math.max(0,ms)+999)/1000;return String.format(java.util.Locale.US,"%02d:%02d",sec/60,sec%60);}
}
