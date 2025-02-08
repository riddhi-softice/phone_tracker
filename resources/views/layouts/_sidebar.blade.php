<!-- ======= Sidebar ======= -->
<aside id="sidebar" class="sidebar">
    <ul class="sidebar-nav" id="sidebar-nav">

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('dashboard') ? '' : 'collapsed' }}" href="{{ route('dashboard') }}">
                <i class="bi bi-grid"></i>
                <span>Dashboard</span>
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('get_purchase_list') ? '' : 'collapsed' }}" href="{{ route('get_purchase_list') }}">
                <i class="bi bi-person"></i>
                <span>Purchases</span>
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('users.index') ? '' : 'collapsed' }}" href="{{ route('users.index') }}">
                <i class="bi bi-person"></i>
                <span>Users</span>
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('get_setting') ? '' : 'collapsed' }}" href="{{ route('get_setting') }}">
                <i class="bi bi-gear"></i>
                <span>Common Setting</span>
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('privacy_policy') ? '' : 'collapsed' }}" href="{{ route('privacy_policy') }}">
                <i class="bi bi-gear"></i>
                <span>Privacy Policy</span>
            </a>
        </li>

        <li class="nav-item">
            <a class="nav-link {{ request()->routeIs('app_notification.index') ? '' : 'collapsed' }}" href="{{ route('app_notification.index') }}">
                <i class="bi bi-bell"></i>
                <span>Notification</span>
            </a>
        </li>

    </ul>
</aside>
