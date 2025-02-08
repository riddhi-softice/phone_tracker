@extends('layouts.app')

@section('content')
    <div class="pagetitle">
        <h1>Privacy Policy</h1>
        <nav>
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Home</a></li>
            </ol>
        </nav>
    </div>

    <section class="section">
        <form action="{{ route('change_privacy') }}" method="POST">
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
                            <h5 class="card-title">Privacy Policy</h5>
                            @if (!empty($data))
                                <div class="row mb-3">
                                    <div class="col-sm-12">
                                        {{-- <textarea class="form-control" id="show_custom_privacy" placeholder="Enter the Description" rows="5" name="show_custom_privacy"> --}}
                                        <textarea class="tinymce-editor" name="privacy_policy">
                                            {!! $data !!}
                                        </textarea>
                                    </div>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
    </section>
@endsection

@yield('javascript')
