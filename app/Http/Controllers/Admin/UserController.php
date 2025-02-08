<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\UserPurchaseModel;
use DataTables;
use Carbon\Carbon;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $data = User::query();
            return Datatables::of($data)
                ->addIndexColumn()

                ->addColumn('profile_pic', function($row){
                    $url = $row->profile_pic;

                    // $btn = "NoProfile";
                    // if (filter_var($url, FILTER_VALIDATE_URL)) {
                    //     $imageContent = file_get_contents($url);
                    //     if ($imageContent !== false) {
                    //         $base64Image = base64_encode($imageContent);
                    //         $imageSrc = 'data:image/png;base64,' . $base64Image;
                    //         $btn = '<img src="' . $imageSrc . '" alt="Profile Picture" width="50" height="50">';
                    //     } else {
                    //         $imageSrc = '';
                    //     }
                    // } else {
                    //     $imageSrc = '';
                    // }
                    $btn = '<img src="' . $url . '" alt="Profile Picture" width="50" height="50">';
                    return $btn;
                })

                ->addColumn('created_at', function($row){
                    return Carbon::parse($row->created_at)->format('Y-m-d H:i:s');
                })

                ->addColumn('action', function($row){
                    // $btn = '<a href="'.route('users.edit', $row->id).'" class="btn btn-sm btn-warning">Edit</a> &nbsp;';
                    $btn = '<button data-id="'.$row->id.'" data-toggle="modal" data-target="#confirmDeleteModal" class="btn btn-danger btn-sm deleteData">Delete</button>';
                    return $btn;
                })
                ->rawColumns(['action','profile_pic'])
                ->make(true);
        }
        return view('users.index');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Item deleted successfully'], 200);
    }

    public function get_purchase_list(Request $request)
    {
        if ($request->ajax()) {
            $data = UserPurchaseModel::query();
            return DataTables::of($data)
                ->addIndexColumn()
                ->addColumn('created_at', function($row){
                    return Carbon::parse($row->created_at)->format('Y-m-d H:i:s');
                })
                ->make(true);
        }
        return view('users.purchase_index');
    }

}
