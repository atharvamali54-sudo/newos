package com.glassos.launcher;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.database.ContentObserver;
import android.graphics.PixelFormat;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.SeekBar;
import android.widget.TextView;

public class VolumeOverlayService extends Service {

    private WindowManager windowManager;
    private View overlayView;
    private AudioManager audioManager;
    private Handler handler;
    private Runnable hideRunnable;
    private boolean isShowing = false;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
        handler = new Handler(Looper.getMainLooper());
        hideRunnable = new Runnable() {
            @Override
            public void run() {
                hideVolumeOverlay();
            }
        };

        // Listen for system volume changes
        getContentResolver().registerContentObserver(
                Settings.System.CONTENT_URI,
                true,
                new ContentObserver(handler) {
                    @Override
                    public void onChange(boolean selfChange, Uri uri) {
                        super.onChange(selfChange, uri);
                        showVolumeOverlay();
                    }
                }
        );
    }

    private void showVolumeOverlay() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            return;
        }

        if (windowManager == null) {
            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        }

        if (!isShowing) {
            WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                            ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                            : WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                    PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.CENTER_VERTICAL | Gravity.END;
            params.x = 24;

            LayoutInflater inflater = LayoutInflater.from(this);
            overlayView = inflater.inflate(R.layout.overlay_volume, null);

            try {
                windowManager.addView(overlayView, params);
                isShowing = true;
            } catch (Exception e) {
                e.printStackTrace();
                return;
            }
        }

        if (overlayView != null) {
            SeekBar seekBar = overlayView.findViewById(R.id.overlay_volume_slider);
            TextView textLevel = overlayView.findViewById(R.id.overlay_volume_text);

            int current = audioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
            int max = audioManager.getStreamMaxVolume(AudioManager.STREAM_MUSIC);

            if (seekBar != null && max > 0) {
                seekBar.setMax(max);
                seekBar.setProgress(current);
            }
            if (textLevel != null) {
                int percent = (int) (((double) current / max) * 100);
                textLevel.setText(percent + "%");
            }
        }

        handler.removeCallbacks(hideRunnable);
        handler.postDelayed(hideRunnable, 2500);
    }

    private void hideVolumeOverlay() {
        if (isShowing && overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception ignored) {}
            isShowing = false;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        hideVolumeOverlay();
    }
}
