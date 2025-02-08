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
                            <h5 class="card-title">Version Setting</h5>

                            @foreach ($settings as $setting)
                                @if ($setting->setting_key == 'app_version')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Application Version</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="app_version"
                                                value="{{ old('setting_value', $setting->setting_value) }}" required>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == 'app_version_code')
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-4 col-form-label">Application Version
                                            Code</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="app_version_code"
                                                value="{{ old('setting_value', $setting->setting_value) }}" required>
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

