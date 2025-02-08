<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
// use Throwable;

class Handler extends ExceptionHandler
{
    public function register()
    {
        $this->renderable(function (NotFoundHttpException $e) {
            return redirect('/');
        });
    }
}
