package com.e9.resolutewatch;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.ToneGenerator;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class MainActivity extends Activity {
    private TimerEngine timer=new TimerEngine();
    private final Handler handler=new Handler(Looper.getMainLooper());
    private long lastWall=System.currentTimeMillis();
    private SharedPreferences prefs;
    private ToneGenerator tones;
    private Vibrator vibrator;
    private MediaPlayer horn;
    private int page=0, field=0;
    private boolean visible=false;
    private LinearLayout root;
    private ScrollView scroll;
    private TextView clock, phase, status;
    private Button master, arm;
    private final TextView[] penaltyTime=new TextView[4], penaltyState=new TextView[4];
    private final int[][] scores=new int[4][2];
    private final String[][] names=new String[4][2];
    private final Runnable tick=new Runnable(){public void run(){if(!visible)return;advance(true);refresh();handler.postDelayed(this,100);}};

    @Override public void onCreate(Bundle b){
        super.onCreate(b);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        prefs=getSharedPreferences("resolute-watch",MODE_PRIVATE);
        vibrator=(Vibrator)getSystemService(VIBRATOR_SERVICE);
        try{tones=new ToneGenerator(AudioManager.STREAM_MUSIC,100);}catch(RuntimeException ignored){}
        try{android.content.res.AssetFileDescriptor fd=getAssets().openFd("horn.wav");horn=new MediaPlayer();horn.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());horn.setDataSource(fd.getFileDescriptor(),fd.getStartOffset(),fd.getLength());fd.close();horn.prepare();}catch(Exception ignored){horn=null;}
        restore();advance(false);build(0);
    }
    private int dp(float n){return Math.round(n*getResources().getDisplayMetrics().density);}
    private TextView text(String value,int size){TextView t=new TextView(this);t.setText(value);t.setTextColor(Color.WHITE);t.setTextSize(size);t.setGravity(Gravity.CENTER);t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);return t;}
    private LinearLayout vertical(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);return l;}
    private void label(String title){TextView v=text(title,14);v.setPadding(0,dp(10),0,dp(6));root.addView(v);}
    private Button button(String value,boolean red,Runnable action){Button b=new Button(this);b.setAllCaps(false);b.setText(value);b.setTextSize(13);b.setTextColor(Color.WHITE);b.setPadding(dp(3),0,dp(3),0);b.setMinWidth(0);b.setMinimumWidth(0);b.setMinHeight(dp(44));GradientDrawable bg=new GradientDrawable();bg.setColor(red?0xffc62828:0xff2d2d2d);bg.setCornerRadius(dp(22));b.setBackground(bg);b.setOnClickListener(v->{advance(false);action.run();save();refresh();});return b;}
    private void row(Button... buttons){LinearLayout r=new LinearLayout(this);r.setGravity(Gravity.CENTER);for(Button b:buttons){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(0,dp(48),1);p.setMargins(dp(2),dp(3),dp(2),dp(3));r.addView(b,p);}root.addView(r);}
    private void build(int screen){
        page=screen;clock=phase=status=null;master=arm=null;for(int i=0;i<4;i++){penaltyTime[i]=null;penaltyState[i]=null;}
        scroll=new ScrollView(this);scroll.setBackgroundColor(Color.BLACK);scroll.setFillViewport(true);root=vertical();root.setPadding(dp(24),dp(36),dp(24),dp(44));scroll.addView(root);setContentView(scroll);
        label("RESOLUTE");
        row(button("Game",page==0,()->build(0)),button("Penalties",page==1,()->build(1)));
        if(page==0){
            phase=text("",18);root.addView(phase);
            LinearLayout r=new LinearLayout(this);r.setGravity(Gravity.CENTER);
            Button minus=button("−",false,()->timer.adjust(-1000)),plus=button("+",false,()->timer.adjust(1000));
            r.addView(minus,new LinearLayout.LayoutParams(dp(40),dp(48)));clock=text("",36);clock.setFontFeatureSettings("tnum");r.addView(clock,new LinearLayout.LayoutParams(0,dp(70),1));r.addView(plus,new LinearLayout.LayoutParams(dp(40),dp(48)));root.addView(r);
            master=button("",true,()->timer.toggleGame());row(master);
            status=text("",12);root.addView(status);
            row(button("Previous",false,()->timer.next(-1)),button("Next",false,()->timer.next(1)));
            row(button("Reset clock",false,()->timer.resetGame()));
        } else if(page==1){
            label("PENALTY CLOCKS");arm=button("",true,()->timer.togglePenalties());row(arm);
            master=button("",true,()->timer.toggleGame());row(master);
            for(int i=0;i<4;i++){final int slot=i;label("PENALTY "+(i+1));penaltyTime[i]=text("",30);root.addView(penaltyTime[i]);penaltyState[i]=text("",12);root.addView(penaltyState[i]);row(button(":30",false,()->timer.setPenalty(slot,30000)),button("1:00",false,()->timer.setPenalty(slot,60000)));row(button("2:00",false,()->timer.setPenalty(slot,120000)),button("3:00",false,()->timer.setPenalty(slot,180000)));row(button("+5",false,()->timer.addPenalty(slot,5000)),button("Clear",false,()->timer.setPenalty(slot,0)));}
        } else if(page==2){
            label("GAME SETTINGS");row(button("Quarters / halves: "+timer.periods,false,()->number("Quarters / halves",timer.periods,1,99,value->{timer.periods=value;timer.period=Math.min(timer.period,value);build(2);})));row(button("Minutes: "+timer.minutes,false,()->number("Minutes per quarter / half",timer.minutes,1,999,value->{timer.minutes=value;timer.resetGame();build(2);})));label("DEFAULT: 4 × 8 MINUTES");
            row(button("Test alerts",false,()->{claps();vibrate(new long[]{0,100,200,100});}));row(button("Reset everything",false,()->new AlertDialog.Builder(this).setTitle("Reset everything?").setMessage("Clear clocks, teams and all scores?").setNegativeButton("Cancel",null).setPositiveButton("Reset",(d,w)->{timer=new TimerEngine();field=0;defaults();save();build(0);}).show()));
        } else {
            label("FIELD "+(field+1));row(button("Change field",false,()->{field=(field+1)%4;build(3);}));
            for(int side=0;side<2;side++){final int team=side;label("Team "+(side+1));row(button(names[field][side],false,()->editName(team)));label(String.valueOf(scores[field][side]));row(button("− Goal",false,()->{scores[field][team]=Math.max(0,scores[field][team]-1);build(3);}),button("+ Goal",true,()->{scores[field][team]=Math.min(999,scores[field][team]+1);build(3);}));}
            label("Scores stay on this watch.");
        }
        row(button("Settings",page==2,()->build(2)),button("Scores",page==3,()->build(3)));label("e9 Lacrosse · Watch 1.0");refresh();
    }
    interface IntAction {void accept(int value);}
    private void number(String title,int value,int min,int max,IntAction action){EditText input=new EditText(this);input.setInputType(InputType.TYPE_CLASS_NUMBER);input.setText(String.valueOf(value));AlertDialog dialog=new AlertDialog.Builder(this).setTitle(title).setView(input).setNegativeButton("Cancel",null).setPositiveButton("Set",null).create();dialog.setOnShowListener(d->dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener(v->{try{int n=Integer.parseInt(input.getText().toString());if(n<min||n>max)throw new NumberFormatException();advance(false);action.accept(n);save();dialog.dismiss();}catch(NumberFormatException e){input.setError("Enter "+min+"–"+max);}}));dialog.show();}
    private void editName(int side){EditText input=new EditText(this);input.setSingleLine();input.setText(names[field][side]);new AlertDialog.Builder(this).setTitle("Team "+(side+1)).setView(input).setNegativeButton("Cancel",null).setPositiveButton("Save",(d,w)->{String name=input.getText().toString().trim();if(!name.isEmpty())names[field][side]=name.substring(0,Math.min(60,name.length()));save();build(3);}).show();}
    private void refresh(){if(clock!=null)clock.setText(TimerEngine.format(timer.remaining));if(phase!=null)phase.setText("GAME CLOCK "+timer.period+" / "+timer.periods);if(master!=null)master.setText(timer.running?"Pause all clocks":"Start game");if(status!=null)status.setText(timer.running?"RUNNING":timer.remaining==0?"ENDED":"PAUSED");if(arm!=null)arm.setText(timer.anyArmed()?"Pause penalties":"Start all penalties");for(int i=0;i<4;i++)if(penaltyTime[i]!=null){penaltyTime[i].setText(TimerEngine.format(timer.penalties[i]));penaltyState[i].setText(timer.penalties[i]==0?"EMPTY / COMPLETE":!timer.armed[i]?"WAITING FOR START":timer.running?"RUNNING":"MASTER PAUSED");}}
    private void advance(boolean sound){long now=System.currentTimeMillis(),dt=Math.max(0,now-lastWall);lastWall=now;int events=timer.advance(dt);if(!sound||!visible||dt>2000)return;if((events&TimerEngine.GAME_END)!=0){if(horn!=null){horn.seekTo(0);horn.start();}else beep(1500);vibrate(new long[]{0,700,200,700});}else{if((events&TimerEngine.MINUTE)!=0){claps();vibrate(new long[]{0,100,200,100});}if((events&TimerEngine.PENALTY_END)!=0){beep(90);handler.postDelayed(()->beep(90),160);handler.postDelayed(()->beep(90),320);vibrate(new long[]{0,90,70,90,70,90});}else if((events&TimerEngine.BEEP)!=0){beep(80);vibrate(new long[]{0,50});}}}
    private void beep(int ms){if(visible&&tones!=null)tones.startTone(ToneGenerator.TONE_PROP_BEEP,ms);}
    private void vibrate(long[] pattern){if(vibrator!=null&&vibrator.hasVibrator())vibrator.vibrate(VibrationEffect.createWaveform(pattern,-1));}
    private void claps(){try{int rate=22050;short[] samples=new short[(int)(rate*.55)];java.util.Random random=new java.util.Random();for(int offset:new int[]{0,(int)(rate*.32)})for(int i=0;i<(int)(rate*.18);i++){double time=i/(double)rate;double volume=Math.min(1,time/.002)*Math.exp(-30*time);samples[offset+i]=(short)((random.nextDouble()*2-1)*volume*30000);}AudioTrack track=new AudioTrack.Builder().setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()).setAudioFormat(new AudioFormat.Builder().setSampleRate(rate).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build()).setTransferMode(AudioTrack.MODE_STATIC).setBufferSizeInBytes(samples.length*2).build();track.write(samples,0,samples.length);track.play();handler.postDelayed(track::release,1000);}catch(RuntimeException ignored){beep(100);handler.postDelayed(()->beep(100),320);}}
    private void defaults(){for(int i=0;i<4;i++)for(int j=0;j<2;j++){names[i][j]="Team "+(i*2+j+1);scores[i][j]=0;}}
    private void restore(){defaults();timer.periods=Math.max(1,Math.min(99,prefs.getInt("periods",4)));timer.minutes=Math.max(1,Math.min(999,prefs.getInt("minutes",8)));timer.period=Math.max(1,Math.min(timer.periods,prefs.getInt("period",1)));timer.remaining=Math.max(0,prefs.getLong("remaining",480000));timer.running=prefs.getBoolean("running",false);lastWall=prefs.getLong("last",System.currentTimeMillis());field=Math.max(0,Math.min(3,prefs.getInt("field",0)));for(int i=0;i<4;i++){timer.penalties[i]=Math.max(0,prefs.getLong("pen"+i,0));timer.armed[i]=prefs.getBoolean("armed"+i,false);for(int j=0;j<2;j++){names[i][j]=prefs.getString("name"+i+j,names[i][j]);scores[i][j]=Math.max(0,Math.min(999,prefs.getInt("score"+i+j,0)));}}}
    private void save(){SharedPreferences.Editor e=prefs.edit().putInt("periods",timer.periods).putInt("minutes",timer.minutes).putInt("period",timer.period).putLong("remaining",timer.remaining).putBoolean("running",timer.running).putLong("last",lastWall).putInt("field",field);for(int i=0;i<4;i++){e.putLong("pen"+i,timer.penalties[i]).putBoolean("armed"+i,timer.armed[i]);for(int j=0;j<2;j++)e.putString("name"+i+j,names[i][j]).putInt("score"+i+j,scores[i][j]);}e.apply();}
    @Override protected void onResume(){super.onResume();visible=true;advance(false);refresh();handler.removeCallbacks(tick);handler.post(tick);}
    @Override protected void onPause(){advance(false);save();visible=false;handler.removeCallbacks(tick);if(tones!=null)tones.stopTone();if(horn!=null&&horn.isPlaying())horn.pause();if(vibrator!=null)vibrator.cancel();super.onPause();}
    @Override protected void onDestroy(){if(tones!=null)tones.release();if(horn!=null)horn.release();super.onDestroy();}
}
