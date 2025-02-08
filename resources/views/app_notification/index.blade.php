@extends('layouts.app')

@section('content')
    <div class="pagetitle">
        <h1>Shedule Notification</h1>
        <nav>
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('dashboard') }}">Home</a></li>
                <li class="breadcrumb-item active">Shedule Notification</li>
            </ol>
        </nav>
    </div>

    <section class="section">
        <div class="row">
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title">Shedule Notification List</h5>
                            <div>
                                <a href="{{ route('app_notification.create') }}" class="btn btn-primary">New Notification</a>
                            </div>
                        </div>
                        <table class="table datatable">
                            <thead>
                                <tr>
                                    <th>Thumbnail</th>
                                    <th>Title</th>
                                    {{-- <th>Type</th> --}}
                                    <th>Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($appNoti as $app_noti)
                                    <?php
                                        $notiData = json_decode($app_noti['notification_data'],true);
                                    ?>
                                    <tr>
                                        <td>
                                            @if ($notiData['notification_image'])
                                                <a href="{{ asset('public/' .$notiData['notification_image']) }}" target="_blank">
                                                    <img src="{{ asset('public/' .$notiData['notification_image']) }}" alt="{{ $app_noti->name }}" width="50" height="50">
                                                </a>
                                            @else
                                                <a href="{{ asset('public/img/No-Image-Placeholder.svg') }}" target="_blank">
                                                    <img src="{{ asset('public/img/No-Image-Placeholder.svg') }}" alt="img" width="50" height="50">
                                                </a>
                                            @endif
                                        </td>
                                        <td>{{ $notiData['notification_title'] }}</td>
                                        {{-- <td>{{ str_replace('_', ' ', $app_noti->type) }}</td> --}}
                                        <td>
                                            @php
                                                $formattedTime = '';
                                                if (isset($notiData['notification_time']) && !empty($notiData['notification_time'])) {
                                                    try {
                                                        $formattedTime = \Carbon\Carbon::createFromFormat('H:i', $notiData['notification_time'], 'UTC')
                                                            ->format('h:i A');  // Convert to 12-hour format with AM/PM
                                                    } catch (\Exception $e) {
                                                        $formattedTime = 'Invalid Time';
                                                    }
                                                }
                                            @endphp
                                            {{ $formattedTime }}
                                        </td>
                                        <td>
                                            <a href="{{ route('app_notification.edit', $app_noti->id) }}" class="btn btn-sm btn-warning">Edit</a>
                                            <form action="{{ route('app_notification.destroy', $app_noti->id) }}" method="POST" style="display: inline-block;">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Are you sure?')">Delete</button>
                                            </form>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </section>
@endsection

@yield('javascript')
