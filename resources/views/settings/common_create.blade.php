@extends('layouts.app')

@section('content')
    <div class="pagetitle">
        <h1>Common Setting</h1>
        <nav>
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Home</a></li>
            </ol>
        </nav>
    </div>

    <section class="section">
        <form action="{{ route('change_setting') }}" method="POST" enctype="multipart/form-data">
            @csrf

            <!-- <input type="hidden" name="_token" value="{{ csrf_token() }}"> -->

            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            <div class="row">
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Application Version Setting</h5>

                            @foreach ($settings as $setting)
                                @if ($setting->setting_key == 'app_version')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Version</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="app_version" value="{{ old('setting_value', $setting->setting_value) }}" required>
                                        </div>
                                    </div>
                                @endif
                                @if ($setting->setting_key == 'version_status')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Version Status</label>
                                        <div class="col-sm-8">
                                            <!-- <input type="text" class="form-control" name="version_status"
                                                value="{{ old('setting_value', $setting->setting_value) }}" required> -->
                                            <select name="version_status" id="version_status" class="form-control" required>
                                                <option value="true" {{ ($setting->setting_value == "true" ? 'selected' : '') }}> True </option>
                                                <option value="false" {{ $setting->setting_value == "false" ? 'selected' : '' }}> False </option>
                                            </select>
                                        </div>
                                    </div>
                                @endif
                                @if ($setting->setting_key == 'dialog_title')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Dialog Title</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="dialog_title"
                                                value="{{ old('setting_value', $setting->setting_value) }}" required>
                                        </div>
                                    </div>
                                @endif
                                @if ($setting->setting_key == 'dialog_message')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Dialog Message</label>
                                        <div class="col-sm-8">
                                            <textarea class="form-control" name="dialog_message" rows="10" required>{{ old('setting_value', $setting->setting_value) }}</textarea>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == 'action_button')
                                    <hr>
                                    <h5 class="card-title">Version Action</h5>

                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Action Button</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="action_button" value="{{ old('setting_value', $setting->setting_value) }}" required>
                                        </div>
                                    </div>
                                @endif
                                @if ($setting->setting_key == 'action_button_text')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Button Text </label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="action_button_text" value="{{ old('setting_value', $setting->setting_value) }}" required>
                                        </div>
                                    </div>
                                @endif
                            @endforeach                        
                            
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    </section>
@endsection

@yield('javascript')

