<?php
    $notiData = json_decode($app_notification['notification_data'],true);
?>

@extends('layouts.app')

@section('content')
    <div class="pagetitle">
        <h1>Notification</h1>
        <nav>
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Home</a></li>
                {{-- <li class="breadcrumb-item active"><a href="{{ route('categories.index') }}">Categories</a></li> --}}
            </ol>
        </nav>
    </div>

    <section class="section">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">

                        <h5 class="card-title">Edit Notification Form</h5>

                        <form action="{{ route('app_notification.update', $app_notification->id) }}" method="POST" enctype="multipart/form-data">
                            @csrf
                            @method('PUT')

                            <div class="row mb-3">
                                <label for="type" class="col-sm-2 col-form-label">Select Notification Type</label>
                                <div class="col-sm-10">
                                    <select class="form-control" id="notification_type" name="notification_type" required>
                                        <option value="direct" {{ $app_notification->notification_type == '0' ? 'selected' : '' }}>Direct</option>
                                        <option value="schedule" {{ $app_notification->notification_type == '1' ? 'selected' : '' }}>Schedule</option>
                                    </select>
                                </div>
                            </div>
                            <div class="row mb-3" id="schedule-time">
                                <label for="inputTime" class="col-sm-2 col-form-label">Time</label>
                                <div class="col-sm-10">
                                    <input type="time" class="form-control" id="schedule_time" name="schedule_time" value="{{ old('name', $notiData['notification_time']) }}">
                                </div>
                            </div>

                            {{-- <div class="row mb-3" id="type">
                                <label for="inputTime" class="col-sm-2 col-form-label">Select Type</label>
                                <div class="col-sm-10">
                                    <select class="form-control" id="type" name="type" required>
                                        <option value="word_of_the_day" {{ $app_notification->type == 'word_of_the_day' ? 'selected' : '' }}>word of the day</option>
                                        <option value="sentence_of_the_day" {{ $app_notification->type == 'sentence_of_the_day' ? 'selected' : '' }}>sentence of the day</option>
                                        <option value="reward_video" {{ $app_notification->type == 'reward_video' ? 'selected' : '' }}>reward video</option>
                                        <option value="chat_communication" {{ $app_notification->type == 'chat_communication' ? 'selected' : '' }}>chat communication</option>
                                        <option value="play_game" {{ $app_notification->type == 'play_game' ? 'selected' : '' }}>play game</option>
                                        <option value="day_wise" {{ $app_notification->type == 'day_wise' ? 'selected' : '' }}>day wise</option>
                                        <option value="conversation" {{ $app_notification->type == 'conversation' ? 'selected' : '' }}>conversation</option>
                                    </select>
                                </div>
                            </div> --}}

                            <div class="row mb-3">
                                <label for="notification_title" class="col-sm-2 col-form-label">Notification Title</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="notification_title" value="{{ old('name',$notiData['notification_title']) }}" required>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="notification_url" class="col-sm-2 col-form-label">Notification URL</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="text" name="notification_url" value="{{ old('name', $notiData['notification_url']) }}">
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="notification_description" class="col-sm-2 col-form-label">Notification Description</label>
                                <div class="col-sm-10">
                                    <textarea class="form-control" type="text" name="notification_description" >{{  $notiData['notification_description'] }}</textarea>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="inputNumber" class="col-sm-2 col-form-label">Notification Image</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="file" id="notification_image" name="notification_image">
                                    @if ($notiData['notification_image'])
                                        <img src="{{ asset('public/' .$notiData['notification_image']) }}" alt="Preview Image" class="mt-2" style="max-width: 150px;max-height: 150px;">
                                    @endif
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary">Send</button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection
@yield('javascript')

<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
<script>
    $(document).ready(function() {

        var notification_type = "{{$app_notification->notification_type}}";
        if(!notification_type){
            $("#schedule-time").css("display", "none");
            $("#type").css("display", "none");
        }

        $("#notification_type").change(function() {
            if ($(this).val() === "schedule") {
                $("#schedule-time").show();
                $("#type").show();
            } else {
                $("#schedule-time").hide();
                $("#type").hide();
            }
        });
    });
</script>
