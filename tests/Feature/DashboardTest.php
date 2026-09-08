<?php

use App\Enums\TeamRole;
use App\Models\Product;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
});

test('dashboard includes pending invitations for the authenticated user', function () {
    $owner = User::factory()->create(['name' => 'Taylor Otwell']);
    $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
    $team = Team::factory()->create(['name' => 'Laravel Team']);

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $invitation = TeamInvitation::factory()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $response = $this
        ->actingAs($invitedUser)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('pendingInvitations', 1)
        ->where('pendingInvitations.0.code', $invitation->code)
        ->where('pendingInvitations.0.inviterName', 'Taylor Otwell')
        ->where('pendingInvitations.0.team.name', 'Laravel Team')
        ->where('pendingInvitations.0.team.slug', $team->slug)
        ->missing('pendingInvitations.0.teamName'),
    );
});

test('dashboard does not include accepted invitations', function () {
    $owner = User::factory()->create();
    $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    TeamInvitation::factory()->accepted()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $response = $this
        ->actingAs($invitedUser)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('pendingInvitations', 0),
    );
});

test('dashboard excludes expired invitations without deleting them', function () {
    $owner = User::factory()->create();
    $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $invitation = TeamInvitation::factory()->expired()->create([
        'team_id' => $team->id,
        'email' => 'invited@example.com',
        'invited_by' => $owner->id,
    ]);

    $response = $this
        ->actingAs($invitedUser)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('pendingInvitations', 0),
    );

    $this->assertDatabaseHas('team_invitations', [
        'id' => $invitation->id,
    ]);
});

test('dashboard does not include or delete other users invitations', function () {
    $owner = User::factory()->create();
    $invitedUser = User::factory()->create(['email' => 'invited@example.com']);
    $team = Team::factory()->create();

    $team->members()->attach($owner, ['role' => TeamRole::Owner->value]);

    $invitation = TeamInvitation::factory()->expired()->create([
        'team_id' => $team->id,
        'email' => 'someone@example.com',
        'invited_by' => $owner->id,
    ]);

    $response = $this
        ->actingAs($invitedUser)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('pendingInvitations', 0),
    );

    $this->assertDatabaseHas('team_invitations', [
        'id' => $invitation->id,
    ]);
});

test('dashboard provides accurate expiration metrics and previews expiring products', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;

    // Expiring soon (within 7 days) with stock
    $expiringProduct = Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Leche Descremada',
        'sku' => 'LEC-001',
        'stock' => 12,
        'is_active' => true,
        'expiration_date' => now()->addDays(3)->toDateString(),
    ]);

    // Expired with stock
    $expiredProduct = Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Manteca 200g',
        'sku' => 'MAN-001',
        'stock' => 4,
        'is_active' => true,
        'expiration_date' => now()->subDays(1)->toDateString(),
    ]);

    // Expiring soon but out of stock (should not count in actionable alerts)
    Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Queso Rallado',
        'sku' => 'QUE-001',
        'stock' => 0,
        'is_active' => true,
        'expiration_date' => now()->addDays(2)->toDateString(),
    ]);

    // Long expiration
    Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Fideos Spaghetti',
        'sku' => 'FID-001',
        'stock' => 30,
        'is_active' => true,
        'expiration_date' => now()->addDays(90)->toDateString(),
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('dashboard'));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('metrics.expiringSoonProducts', 1)
        ->where('metrics.expiredProducts', 1)
        ->has('expiringProducts', 2)
        ->where('expiringProducts.0.id', $expiredProduct->id)
        ->where('expiringProducts.0.is_expired', true)
        ->where('expiringProducts.1.id', $expiringProduct->id)
        ->where('expiringProducts.1.is_expired', false)
    );
});

