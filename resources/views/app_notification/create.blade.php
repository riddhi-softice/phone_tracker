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

                        <h5 class="card-title">Notification Form</h5>

                        <form action="{{ route('app_notification.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf

                            <div class="row mb-3">
                                <label for="notification_type" class="col-sm-2 col-form-label">Select Notification Type</label>
                                <div class="col-sm-10">
                                    <select class="form-control" id="notification_type" name="notification_type" required>
                                        <option value="direct">Direct</option>
                                        <option value="schedule">Schedule</option>
                                    </select>
                                </div>
                            </div>

                            <div class="row mb-3" id="schedule-time">
                                <label for="inputTime" class="col-sm-2 col-form-label">Time</label>
                                <div class="col-sm-10">
                                    <input type="time" class="form-control" id="schedule_time" name="schedule_time" min="00:00" max="23:59" step="60">
                                </div>
                            </div>

                            {{-- <div class="row mb-3" id="type">
                                <label for="inputTime" class="col-sm-2 col-form-label">Select Type</label>
                                <div class="col-sm-10">
                                    <select class="form-control" id="type" name="type" required>
                                        <option value="word_of_the_day">word of the day</option>
                                        <option value="sentence_of_the_day">sentence of the day</option>
                                        <option value="reward_video">reward video</option>
                                        <option value="chat_communication">chat communication</option>
                                        <option value="play_game">play game</option>
                                        <option value="day_wise">day wise</option>
                                        <option value="conversation">conversation</option>
                                    </select>
                                </div>
                            </div> --}}

                            <div class="row mb-3">
                                <label for="notification_title" class="col-sm-2 col-form-label">Notification Title</label>
                                <div class="col-sm-10">
                                    <input type="text" class="form-control" name="notification_title" required>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="notification_url" class="col-sm-2 col-form-label">Notification URL</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="text" name="notification_url">
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="notification_description" class="col-sm-2 col-form-label">Notification Description</label>
                                <div class="col-sm-10">
                                    <textarea class="form-control" type="text" name="notification_description"></textarea>
                                </div>
                            </div>

                            <div class="row mb-3">
                                <label for="inputNumber" class="col-sm-2 col-form-label">Notification Image</label>
                                <div class="col-sm-10">
                                    <input class="form-control" type="file" id="notification_image" name="notification_image">
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
        // Hide the time input initially
        $("#schedule-time").css("display", "none");
        $("#type").css("display", "none");

        // Handle the change event of the select element
        $("#notification_type").change(function() {
            // If "Schedule" is selected, show the time input; otherwise, hide it
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
