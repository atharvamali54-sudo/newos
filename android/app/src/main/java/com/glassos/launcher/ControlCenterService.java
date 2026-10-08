package com.glassos.launcher;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.provider.Settings;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;

public class ControlCenterService extends Service {

    private WindowManager windowManager;
    private View gestureHandle;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
            return;
        }

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        setupGestureHandle();
    }

    private void setupGestureHandle() {
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                40, // Thin strip at top
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                        ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                        : WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
        );

        params.gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;

        gestureHandle = new View(this);
        gestureHandle.setOnTouchListener(new View.OnTouchListener() {
            private float startY = 0;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        startY = event.getRawY();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        if (event.getRawY() - startY > 80) {
                            // Swiped down! Open Launcher with Control Center open
                            openControlCenter();
                            return true;
                        }
                        break;
                }
                return false;
            }
        });

        try {
            windowManager.addView(gestureHandle, params);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void openControlCenter() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("OPEN_CONTROL_CENTER", true);
        startActivity(intent);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (gestureHandle != null && windowManager != null) {
            try {
                windowManager.removeView(gestureHandle);
            } catch (Exception ignored) {}
        }
    }
}
