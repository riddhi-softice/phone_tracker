<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CommonSetting;

class CommonSettingController extends Controller
{
    public function get_setting()
    {
        $settings = CommonSetting::get();
        return view('settings.common_create', compact('settings'));
    }

    public function change_setting(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            # Check if the value is an array and convert it to a comma-separated string
            if (is_array($value)) {
                //   $value = implode(',', $value);
                $value = json_encode($value);
            }

            CommonSetting::where("setting_key", $key)->when($request->filled($key), function ($query) use ($value) {
                $query->update(['setting_value' => $value]);
            });
        }

        return redirect()->route('get_setting')->with('success', 'Data updated successfully.');
    }

    public function privacy_policy()
    {
        $data = CommonSetting::where('setting_key','privacy_policy')->pluck('setting_value')->first();
        return view('settings.privacy_policy', compact('data'));
    }

    public function change_privacy(Request $request)
    {
        foreach ($request->all() as $key => $value) {
            CommonSetting::where("setting_key", $key)->when($request->filled($key), function ($query) use ($value) {
                $query->update(['setting_value' => $value]);
            });
        }
        return redirect()->route('privacy_policy')->with('success', 'Data updated successfully.');
    }

}
