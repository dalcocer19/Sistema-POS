<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingRequest;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandingController extends Controller
{
    /**
     * Show the branding settings page.
     */
    public function edit(Request $request): Response
    {
        $team = $request->user()->currentTeam;

        abort_unless($team instanceof Team, 404);

        Gate::authorize('update', $team);

        return Inertia::render('settings/branding', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'slug' => $team->slug,
                'logoUrl' => $team->logo_url,
            ],
            'canUpdateBranding' => $request->user()->toTeamPermissions($team)->canUpdateTeam,
        ]);
    }

    /**
     * Upload a new team logo.
     */
    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        abort_unless($team instanceof Team, 404);

        if ($team->logo_path) {
            Storage::disk('public')->delete($team->logo_path);
        }

        $path = $request->file('logo')->store('team-logos', 'public');

        $team->update(['logo_path' => $path]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo updated.')]);

        return to_route('branding.edit');
    }

    /**
     * Remove the team logo.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $team = $request->user()->currentTeam;

        abort_unless($team instanceof Team, 404);

        Gate::authorize('update', $team);

        if ($team->logo_path) {
            Storage::disk('public')->delete($team->logo_path);
            $team->update(['logo_path' => null]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Logo removed.')]);

        return to_route('branding.edit');
    }
}
