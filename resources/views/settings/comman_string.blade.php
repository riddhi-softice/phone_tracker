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

                <div class="col-lg-12">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Admob Ads Setting</h5>

                            @foreach ($settings as $setting)

                                @if ($setting->setting_key == "Inter")
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Inter</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Inter')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Inter">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Inter[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                @if ($setting->setting_key == "Big_Banner")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Big Banner</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Big_Banner')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Big_Banner">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Big_Banner[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                @if ($setting->setting_key == "Small_Banner")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Small Banner</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Small_Banner')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Small_Banner">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Small_Banner[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                @if ($setting->setting_key == "Med_Banner")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Med Banner</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Med_Banner')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Med_Banner">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Med_Banner[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                @if ($setting->setting_key == "AppOpen")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">AppOpen</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('AppOpen')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="AppOpen">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="AppOpen[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                <!--    @if ($setting->setting_key == "Big_Native")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Big Native</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Big_Native')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Big_Native">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Big_Native[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif

                                @if ($setting->setting_key == "Collapse_Banner")
                                    &nbsp; <hr>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">Collapse Banner</label>
                                        <div class="col-sm-2">
                                            <button type="button" class="btn btn-success" onclick="addTextField('Collapse_Banner')">Add New</button>
                                        </div>
                                    </div>

                                    <div id="Collapse_Banner">
                                        @foreach (explode(',',$setting->setting_value) as $key=>$value)
                                            <div class="row mb-3">
                                                <label for="inputText" class="col-sm-2 col-form-label"></label>
                                                <div class="col-sm-8">
                                                    <input type="text" class="form-control" name="Collapse_Banner[]" value="{{ $value }}" required>
                                                </div>
                                                <div class="col-sm-2">
                                                    <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                @endif-->

                                @if ($setting->setting_key == "PHONEPE_MID")
                                    &nbsp; <hr>
                                    <h5 class="card-title">Other Setting</h5>
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">PhonePe MID</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="PHONEPE_MID" value="{{ $setting->setting_value }}" required>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == "PHONEPE_SALT_KEY")
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">PhonePe Salt Key</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="PHONEPE_SALT_KEY" value="{{ $setting->setting_value }}" required>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == "PHONEPE_SALT_KEY_INDEX")
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">PhonePe Salt Key Index</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="PHONEPE_SALT_KEY_INDEX" value="{{ $setting->setting_value }}" required>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == "PHONEPE_AMOUNT_RC")
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">PhonePe Amount RC</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="PHONEPE_AMOUNT_RC" value="{{ $setting->setting_value }}" required>
                                        </div>
                                    </div>
                                @endif

                                @if ($setting->setting_key == "PHONEPE_AMOUNT_DL")
                                    <div class="row mb-3">
                                        <label for="inputText" class="col-sm-2 col-form-label">PhonePe Amount DL</label>
                                        <div class="col-sm-8">
                                            <input type="text" class="form-control" name="PHONEPE_AMOUNT_DL" value="{{ $setting->setting_value }}" required>
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
<script>
    function addTextField(value) {
        // Ensure 'Interstitial' is quoted, assuming it's the ID of the element
        var additionalFields = document.getElementById(value);

        // Create a new div for the additional field
        var newField = document.createElement('div');
        newField.className = 'row mb-3';

        // Set the inner HTML of the new div, including the dynamic value
        newField.innerHTML = `
            <label for="inputText" class="col-sm-2 col-form-label"></label>
            <div class="col-sm-8">
                <input type="text" class="form-control" name="${value}[]" required>
            </div>
            <div class="col-sm-2">
                <button type="button" class="btn btn-danger" onclick="removeTextField(this)">Remove</button>
            </div>
        `;
        // Append the new field to the existing element with ID 'Interstitial'
        additionalFields.appendChild(newField);
    }
    function removeTextField(button) {
        var parentDiv = button.parentNode.parentNode;
        parentDiv.parentNode.removeChild(parentDiv);
    }
</script>
