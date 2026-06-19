# Downloads and normalizes World Cup data from free sources:
# - Fjelstul World Cup DB (matches.csv) — 1930-2022
# - openfootball/worldcup.json — 2018, 2022, 2026

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$dataDir = Join-Path $root "data\history"
$fixturesDir = Join-Path $root "data\fixtures"
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
New-Item -ItemType Directory -Force -Path $fixturesDir | Out-Null

function Download-Text($url) {
    (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
}

Write-Host "Downloading Fjelstul matches.csv..."
$csvPath = Join-Path $env:TEMP "wcp-matches.csv"
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jfjelstul/worldcup/master/data-csv/matches.csv" -OutFile $csvPath
$rows = Import-Csv $csvPath

$matches = foreach ($r in $rows) {
    $year = 0
    if ($r.tournament_name -match '(\d{4})') { $year = [int]$Matches[1] }
    if (-not $year -and $r.tournament_id -match '(\d{4})') { $year = [int]$Matches[1] }

    $winner = $null
    if ($r.home_team_win -eq '1') { $winner = $r.home_team_name }
    elseif ($r.away_team_win -eq '1') { $winner = $r.away_team_name }

    [ordered]@{
        id        = $r.match_id
        year      = $year
        date      = $r.match_date
        team1     = $r.home_team_name
        team2     = $r.away_team_name
        team1Code = $r.home_team_code
        team2Code = $r.away_team_code
        score1    = [int]$r.home_team_score
        score2    = [int]$r.away_team_score
        group     = $r.group_name
        stage     = $r.stage_name
        venue     = $r.stadium_name
        city      = $r.city_name
        country   = $r.country_name
        winner    = $winner
        extraTime = $r.extra_time -eq '1'
        penalties = $r.penalty_shootout -eq '1'
        source    = 'fjelstul'
    }
}

$matchesJson = $matches | ConvertTo-Json -Depth 6 -Compress
[System.IO.File]::WriteAllText((Join-Path $dataDir "matches.json"), $matchesJson)
Write-Host "Wrote $($matches.Count) historical matches"

# Team stats from Fjelstul
$teamStats = @{}
foreach ($m in $matches) {
    foreach ($side in @(
        @{ name = $m.team1; code = $m.team1Code; scored = $m.score1; conceded = $m.score2; win = ($m.winner -eq $m.team1) },
        @{ name = $m.team2; code = $m.team2Code; scored = $m.score2; conceded = $m.score1; win = ($m.winner -eq $m.team2) }
    )) {
        if (-not $teamStats[$side.name]) {
            $teamStats[$side.name] = @{ name = $side.name; code = $side.code; played = 0; wins = 0; draws = 0; losses = 0; goalsFor = 0; goalsAgainst = 0; tournaments = @{} }
        }
        $t = $teamStats[$side.name]
        $t.played++
        $t.goalsFor += $side.scored
        $t.goalsAgainst += $side.conceded
        if ($m.winner -eq $side.name) { $t.wins++ }
        elseif ($null -eq $m.winner) { $t.draws++ }
        else { $t.losses++ }
        $t.tournaments["$($m.year)"] = $true
    }
}

$teams = $teamStats.Values | ForEach-Object {
    $_.tournaments = @($_.tournaments.Keys | Sort-Object)
    $_
} | Sort-Object name

$teamsJson = $teams | ConvertTo-Json -Depth 6 -Compress
[System.IO.File]::WriteAllText((Join-Path $dataDir "teams.json"), $teamsJson)
Write-Host "Wrote $($teams.Count) team profiles"

# Tournament index
$yearCounts = @{}
foreach ($m in $matches) {
    $y = "$($m.year)"
    if (-not $yearCounts[$y]) { $yearCounts[$y] = 0 }
    $yearCounts[$y]++
}
foreach ($y in @(2018, 2022, 2026)) {
    if (-not $yearCounts["$y"]) { $yearCounts["$y"] = 0 }
}
$tournaments = $yearCounts.Keys | Sort-Object { [int]$_ } | ForEach-Object {
    [ordered]@{ year = [int]$_; matchCount = $yearCounts[$_]; source = if ($_ -ge 2018) { 'openfootball+fjelstul' } else { 'fjelstul' } }
}
[System.IO.File]::WriteAllText((Join-Path $root "data\tournaments.json"), ($tournaments | ConvertTo-Json -Compress))

# openfootball fixtures
foreach ($year in @(2018, 2022, 2026)) {
    Write-Host "Downloading openfootball $year..."
    $raw = Download-Text "https://raw.githubusercontent.com/openfootball/worldcup.json/master/$year/worldcup.json"
    $data = $raw | ConvertFrom-Json
    $fixtures = foreach ($m in $data.matches) {
        $s1 = if ($m.score.ft) { $m.score.ft[0] } else { $null }
        $s2 = if ($m.score.ft) { $m.score.ft[1] } else { $null }
        $winner = $null
        if ($null -ne $s1 -and $null -ne $s2) {
            if ($s1 -gt $s2) { $winner = $m.team1 }
            elseif ($s2 -gt $s1) { $winner = $m.team2 }
        }
        [ordered]@{
            id     = "$year-$($m.team1)-$($m.team2)-$($m.date)"
            year   = $year
            date   = $m.date
            time   = $m.time
            team1  = $m.team1
            team2  = $m.team2
            score1 = $s1
            score2 = $s2
            group  = $m.group
            round  = $m.round
            venue  = $m.ground
            goals1 = $m.goals1
            goals2 = $m.goals2
            winner = $winner
            source = 'openfootball'
        }
    }
    $fixturesJson = $fixtures | ConvertTo-Json -Depth 8 -Compress
    [System.IO.File]::WriteAllText((Join-Path $fixturesDir "$year.json"), $fixturesJson)
    Write-Host "Wrote $($fixtures.Count) fixtures for $year"
}

Write-Host "Done."
