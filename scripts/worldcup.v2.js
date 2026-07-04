// ================================================================
// WatchTheFall World Cup v4.5.0 - Dynamic Event Engine
// Developed via Qoder (Integrity Guardian Compliant)
// ================================================================

(function () {
  'use strict';

  const DATA_URL = 'data/worldcup.json';
  const EVENTS_URL = 'data/events.json';
  const CONTAINER_ID = 'worldcup-leaderboard';
  const TABLE_ID = 'worldcup-table';
  const DEFAULT_METRIC = 'points';
  const METRIC_LABELS = {
    points: 'Points',
    followers: 'Followers',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    x: 'X (Twitter)'
  };

  const HUB_LINKS = {
    // Main hubs with dedicated pages
    ScotlandWTF: 'regional/pages/scotland.html',
    WatchTheFallWTF: 'index.html',
    AIWTF: 'ai.html',
    AITechWTF: 'ai.html',
    
    // UK Cluster
    BritainWTF: 'regional/pages/britain.html',
    EnglandWTF: 'regional/pages/england.html',
    WalesWTF: 'regional/pages/wales.html',
    NorthernIrelandWTF: '#directory-britain',
    
    // Europe Cluster
    EuropeWTF: 'regional/pages/europe.html',
    IrelandWTF: 'regional/pages/ireland.html',
    FranceWTF: 'regional/pages/france.html',
    GermanyWTF: 'regional/pages/germany.html',
    SpainWTF: 'regional/pages/spain.html',
    ItalyWTF: 'regional/pages/italy.html',
    NetherlandsWTF: 'regional/pages/netherlands.html',
    PolandWTF: 'regional/pages/poland.html',
    SwedenWTF: 'regional/pages/sweden.html',
    
    // Americas & Oceania
    TheWestWTF: '#directory-thewest',
    USAmericaWTF: 'regional/pages/usa.html',
    CanadaWTF: 'regional/pages/canada.html',
    AustraliaWTF: 'regional/pages/australia.html',
    
    // Content hubs (no dedicated pages yet)
    GadgetsWTF: 'index.html#directory',
    ComedyWTF: 'index.html#directory',
    DarkHumourWTF: 'index.html#directory',
    ConceptsWTF: 'index.html#directory'
  };

  const LOGO_MAP = {
    ScotlandWTF: 'assets/logos/scotland-wtf-logo.png',
    WatchTheFallWTF: 'assets/watermark/wtfman.png',
    
    // UK Cluster
    BritainWTF: 'assets/logos/britain-wtf-logo.png',
    EnglandWTF: 'assets/logos/england-wtf-logo.png',
    WalesWTF: 'assets/logos/wales-wtf-logo.png',
    NorthernIrelandWTF: 'assets/logos/northern-ireland-wtf-logo.png',
    
    // Europe Cluster
    EuropeWTF: 'assets/logos/europe-wtf-logo.png',
    IrelandWTF: 'assets/logos/ireland-wtf-logo.png',
    FranceWTF: 'assets/logos/france-wtf-logo.png',
    GermanyWTF: 'assets/logos/germany-wtf-logo.png',
    SpainWTF: 'assets/logos/spain-wtf-logo.png',
    ItalyWTF: 'assets/logos/italy-wtf-logo.png',
    NetherlandsWTF: 'assets/logos/netherlands-wtf-logo.png',
    PolandWTF: 'assets/logos/poland-wtf-logo.png',
    SwedenWTF: 'assets/logos/sweden-wtf-logo.png',
    
    // Americas & Oceania
    TheWestWTF: 'assets/logos/the-west-wtf.png',
    USAmericaWTF: 'assets/logos/usa-wtf-logo.png',
    CanadaWTF: 'assets/logos/canada-wtf-logo.png',
    AustraliaWTF: 'assets/logos/australia-wtf-logo.png',
    
    // AI & Content Hubs
    AIWTF: 'assets/logos/ai-wtf-logo.webp',
    AITechWTF: 'assets/logos/ai-tech-wtf-logo.jpg',
    GadgetsWTF: 'assets/logos/gadgets-wtf-logo.png',
    ComedyWTF: 'assets/logos/c0medy-wtf-logo.jpg',
    DarkHumourWTF: 'assets/logos/dark-humour-wtf-logo.png',
    ConceptsWTF: 'assets/logos/concepts-wtf-logo.png'
  };

  let worldCupData = [];
  let eventsData = {};
  let lastUpdated = '';
  let currentMetric = DEFAULT_METRIC;

  function safeGetArray(input) {
    if (Array.isArray(input)) return input;
    if (input && Array.isArray(input.regions)) return input.regions;
    return [];
  }

  async function loadWorldCupData() {
    try {
      // Load both world cup data and events data
      const [res1, res2] = await Promise.all([
        fetch(DATA_URL, { cache: 'no-store' }),
        fetch(EVENTS_URL, { cache: 'no-store' })
      ]);
      
      const worldCupJson = await res1.json();
      const eventsJson = await res2.json();
      
      worldCupData = safeGetArray(worldCupJson);
      eventsData = eventsJson;
      lastUpdated = worldCupJson.last_updated || '';
      
      // Archive expired events
      archiveExpiredEvents(eventsData);
      
      // Calculate dynamic points based on formula
      worldCupData = worldCupData.map(entry => {
        const dynamicPoints = calculateDynamicScore(entry, eventsData);
        return { ...entry, points: dynamicPoints };
      });
    } catch (err) {
      console.error('❌ Failed to load World Cup data:', err);
      worldCupData = [];
      eventsData = {};
    }
  }

  // Calculate dynamic score based on formula
  function calculateDynamicScore(entry, eventsData) {
    // Get current multipliers
    const multipliers = eventsData.multipliers || {};
    const activeEvents = eventsData.activeEvents || [];
    
    // Get current date for event validation
    const currentDate = new Date();
    
    // Calculate platform weights
    const tiktokCount = Number(entry.followers?.tiktok || 0);
    const instagramCount = Number(entry.followers?.instagram || 0);
    const youtubeCount = Number(entry.followers?.youtube || 0);
    const xCount = Number(entry.followers?.x || 0);
    
    // Apply event multipliers
    let tiktokMultiplier = multipliers.tiktok || 1;
    let instagramMultiplier = multipliers.instagram || 1;
    let youtubeMultiplier = multipliers.youtube || 1;
    let xMultiplier = multipliers.x || 1;
    
    // Process active events
    for (const event of activeEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Check if event is currently active
      if (currentDate >= eventStart && currentDate <= eventEnd) {
        if (event.type === 'platform' && event.target === 'tiktok') {
          tiktokMultiplier *= event.multiplier;
        } else if (event.type === 'platform' && event.target === 'instagram') {
          instagramMultiplier *= event.multiplier;
        } else if (event.type === 'platform' && event.target === 'youtube') {
          youtubeMultiplier *= event.multiplier;
        } else if (event.type === 'platform' && event.target === 'x') {
          xMultiplier *= event.multiplier;
        }
      }
    }
    
    // Calculate follower score with weighted multipliers
    const followerScore = (
      (tiktokCount * 0.4 * tiktokMultiplier) +
      (instagramCount * 0.3 * instagramMultiplier) +
      (youtubeCount * 0.2 * youtubeMultiplier) +
      (xCount * 0.1 * xMultiplier)
    );
    
    // Calculate growth score (difference from previous)
    const previousTiktok = Number(entry.previous?.tiktok || 0);
    const previousInstagram = Number(entry.previous?.instagram || 0);
    const previousYoutube = Number(entry.previous?.youtube || 0);
    const previousX = Number(entry.previous?.x || 0);
    
    const growthScore = (
      Math.max(0, tiktokCount - previousTiktok) * 0.4 * tiktokMultiplier +
      Math.max(0, instagramCount - previousInstagram) * 0.3 * instagramMultiplier +
      Math.max(0, youtubeCount - previousYoutube) * 0.2 * youtubeMultiplier +
      Math.max(0, xCount - previousX) * 0.1 * xMultiplier
    ) * 0.2; // Growth is weighted lower
    
    // Calculate donation score (if available)
    const donationAmount = Number(entry.donations || entry.donations_total || 0);
    const donationScore = Math.log(donationAmount + 1) * (multipliers.donations || 1);
    
    // Calculate commerce score (if available)
    const commerceAmount = Number(entry.merch_revenue || entry.commerce_total || 0);
    const commerceScore = Math.sqrt(commerceAmount) * (multipliers.commerce || 1);
    
    // Apply the proposed weighting formula
    const score = (
      (followerScore * 0.5) +
      (growthScore * 0.2) +
      (donationScore * 0.15) +
      (commerceScore * 0.15)
    );
    
    // Apply region-specific multipliers if any
    const regionMultiplier = multipliers.regions?.[entry.region] || 1;
    return score * regionMultiplier;
  }
  
  function isMetricAllZeros(metric) {
    // Don't force fallback for individual platforms - let users see actual data even if mostly zeros
    if (metric === 'points') return false;
    if (metric === 'followers') {
      // Only fallback to points if ALL entries have zero followers across all platforms
      return worldCupData.every((e) => {
        const total = Number(e.followers?.tiktok || 0) + 
                     Number(e.followers?.instagram || 0) + 
                     Number(e.followers?.youtube || 0) + 
                     Number(e.followers?.x || 0);
        return total === 0;
      });
    }
    // For individual platforms, don't force fallback - show actual values
    return false;
  }

  function getDisplayValue(entry, metric) {
    switch (metric) {
      case 'followers':
        // Sum all platform followers
        const tik = Number(entry.followers?.tiktok || 0);
        const ig = Number(entry.followers?.instagram || 0);
        const yt = Number(entry.followers?.youtube || 0);
        const tw = Number(entry.followers?.x || 0);
        return tik + ig + yt + tw;
      case 'tiktok':
        return Number(entry.followers?.tiktok || 0);
      case 'instagram':
        return Number(entry.followers?.instagram || 0);
      case 'youtube':
        return Number(entry.followers?.youtube || 0);
      case 'x':
        return Number(entry.followers?.x || 0);
      case 'points':
      default:
        return Number(entry.points || 0);
    }
  }

  // Get active events
  function getActiveEvents(eventsData) {
    if (!eventsData || !eventsData.activeEvents) return [];
    
    const currentDate = new Date();
    const activeEvents = [];
    
    for (const event of eventsData.activeEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      if (currentDate >= eventStart && currentDate <= eventEnd) {
        activeEvents.push(event);
      }
    }
    
    return activeEvents;
  }
  
  // Render active events banner
  function renderActiveEventsBanner(activeEvents) {
    if (!activeEvents || activeEvents.length === 0) {
      return '';
    }
    
    const eventsHtml = activeEvents.map(event => {
      const endDate = new Date(event.end);
      const currentDate = new Date();
      const daysLeft = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="wc-event-banner">
          <span class="wc-event-icon">🔥</span>
          <span class="wc-event-text">${event.name}</span>
          <span class="wc-event-countdown">${daysLeft} days left</span>
        </div>
      `;
    }).join('');
    
    return `<div class="wc-events-container">${eventsHtml}</div>`;
  }
  
  // Update active events banner
  function updateActiveEventsBanner(activeEvents) {
    const container = document.getElementById(CONTAINER_ID);
    const existingBanner = container.querySelector('.wc-events-container');
    
    if (existingBanner) {
      existingBanner.remove();
    }
    
    const newBanner = renderActiveEventsBanner(activeEvents);
    if (newBanner) {
      const headerElement = container.querySelector('.wc-header');
      if (headerElement) {
        headerElement.insertAdjacentHTML('afterend', newBanner);
      }
    }
  }
  
  // Archive expired events
  async function archiveExpiredEvents(eventsData) {
    if (!eventsData || !eventsData.activeEvents) return;
    
    const currentDate = new Date();
    const activeEvents = eventsData.activeEvents || [];
    const expiredEvents = [];
    const remainingEvents = [];
    
    for (const event of activeEvents) {
      const eventEnd = new Date(event.end);
      
      if (currentDate > eventEnd) {
        // Event has expired, add to expired events
        expiredEvents.push({
          ...event,
          archived_at: new Date().toISOString(),
          impact: 'Event expired naturally',
          winner: 'TBD' // Could be calculated based on highest score during event
        });
      } else {
        // Event is still active, keep it
        remainingEvents.push(event);
      }
    }
    
    if (expiredEvents.length > 0) {
      try {
        // Load event history
        const historyResponse = await fetch('data/event-history.json');
        const historyData = await historyResponse.json();
        
        // Add expired events to history
        const updatedHistory = {
          archivedEvents: [
            ...(historyData.archivedEvents || []),
            ...expiredEvents
          ]
        };
        
        // In a real implementation with backend, we would save this back to the server
        // For now, we'll just update the in-memory data
        console.log('Expired events archived:', expiredEvents);
        
        // Update events data to remove expired events
        eventsData.activeEvents = remainingEvents;
        
        // Update multipliers to remove expired event effects
        for (const expiredEvent of expiredEvents) {
          if (expiredEvent.type === 'platform' && expiredEvent.target) {
            // Reset platform multiplier to default
            eventsData.multipliers[expiredEvent.target] = 1.0;
          }
        }
        
        console.log('Updated active events:', remainingEvents);
      } catch (error) {
        console.error('Error archiving expired events:', error);
      }
    }
  }
  
  function calculateChange(entry, metric) {
    switch (metric) {
      case 'followers':
        const currTotal = Number(entry.followers?.tiktok || 0) + Number(entry.followers?.instagram || 0) + Number(entry.followers?.youtube || 0) + Number(entry.followers?.x || 0);
        const prevTotal = Number(entry.previous?.tiktok || 0) + Number(entry.previous?.instagram || 0) + Number(entry.previous?.youtube || 0) + Number(entry.previous?.x || 0);
        return currTotal - prevTotal;
      case 'tiktok':
        return Number(entry.followers?.tiktok || 0) - Number(entry.previous?.tiktok || 0);
      case 'instagram':
        return Number(entry.followers?.instagram || 0) - Number(entry.previous?.instagram || 0);
      case 'youtube':
        return Number(entry.followers?.youtube || 0) - Number(entry.previous?.youtube || 0);
      case 'x':
        return Number(entry.followers?.x || 0) - Number(entry.previous?.x || 0);
      case 'points':
      default:
        // Use actual points from data instead of calculating from TikTok
        const prevPoints = Number(entry.previous?.points || entry.points || 0);
        return Number(entry.points || 0) - prevPoints;
    }
  }

  function sortData(metric) {
    const dataCopy = [...worldCupData];
    dataCopy.sort((a, b) => {
      const av = getDisplayValue(a, metric);
      const bv = getDisplayValue(b, metric);
      return bv - av;
    });
    return dataCopy;
  }

  function rankBadge(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  }

  function formatNumber(n) {
    const v = Math.round(Number(n || 0)); // Round to avoid floating point precision issues
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (v >= 1000) return (v / 1000).toFixed(1) + 'K';
    return v.toString();
  }

  function fadeSwap(el, html) {
    el.classList.add('wc-fade-out');
    setTimeout(() => {
      el.innerHTML = html;
      el.classList.remove('wc-fade-out');
      el.classList.add('wc-fade-in');
      setTimeout(() => el.classList.remove('wc-fade-in'), 250);
    }, 150);
  }

  function renderLeaderboard(metric = 'points') {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;
  
    const sorted = sortData(metric);
    const headerMetricLabel = METRIC_LABELS[metric] || 'Points';
    const headerChangeLabel = 'Change';
      
    // Get active events for banner display
    const activeEvents = getActiveEvents(eventsData);
  
    // Check if this is the first render (container is empty or doesn't have the header)
    if (!container.querySelector('.wc-header')) {
      // First render - create the full structure
      const fullHtml = `
        <div class="wc-header">
          <div class="wc-title">World Cup Leaderboard</div>
          <div class="wc-controls">
            <select id="metric-select" class="wc-select">
              <option value="points"${metric === 'points' ? ' selected' : ''}>Points</option>
              <option value="followers"${metric === 'followers' ? ' selected' : ''}>Followers</option>
              <option value="tiktok"${metric === 'tiktok' ? ' selected' : ''}>TikTok</option>
              <option value="instagram"${metric === 'instagram' ? ' selected' : ''}>Instagram</option>
              <option value="youtube"${metric === 'youtube' ? ' selected' : ''}>YouTube</option>
              <option value="x"${metric === 'x' ? ' selected' : ''}>X (Twitter)</option>
            </select>
          </div>
        </div>
        ${renderActiveEventsBanner(activeEvents)}
        <div class="wc-table-wrapper">
          <div id="${TABLE_ID}" class="wc-table">
            <div class="wc-row wc-head">
              <div class="wc-col rank">Rank</div>
              <div class="wc-col hub">Hub</div>
              <div class="wc-col metric">${headerMetricLabel}</div>
              <div class="wc-col change">${headerChangeLabel}</div>
            </div>
            ${sorted
              .map((entry, idx) => {
                const rank = idx + 1;
                const value = getDisplayValue(entry, metric);
                const change = calculateChange(entry, metric);
                const changeSign = change > 0 ? '▲' : change < 0 ? '▼' : '—';
                const changeClass =
                  change > 0 ? 'wc-up' : change < 0 ? 'wc-down' : 'wc-flat';
                const logo =
                  entry.logo || LOGO_MAP[entry.region] || 'assets/watermark/wtfman.png';
                const tagline =
                  entry.tagline ||
                  'Global hub of the WTF Network.';
                const hubLink = HUB_LINKS[entry.region] || '#';
                const isClickable = HUB_LINKS[entry.region] ? true : false;
  
                return `
                <div class="wc-row wc-body wc-animate">
                  <div class="wc-col rank">${rankBadge(rank)} ${rank}</div>
                  <div class="wc-col hub">
                    <div class="wc-hub">
                      <img class="wc-logo" src="${logo}" alt="${entry.region}" onerror="this.style.display='none'"/>
                      <div class="wc-meta">
                        <div class="wc-name">
                          ${isClickable 
                            ? `<a href="${hubLink}" class="wc-hub-link"><strong>${entry.region}</strong></a>` 
                            : `<strong>${entry.region}</strong>`
                          }
                        </div>
                        <div class="wc-tag">${tagline}</div>
                      </div>
                    </div>
                  </div>
                  <div class="wc-col metric">
                    <div class="wc-value">${formatNumber(value)}</div>
                  </div>
                  <div class="wc-col change">
                    <div class="wc-change ${changeClass}">
                      ${changeSign} ${formatNumber(Math.abs(change))}
                    </div>
                  </div>
                </div>`;
              })
              .join('')}
          </div>
        </div>
        <div class="wc-footer">
          <div class="wc-updated">📈 Updated manually${lastUpdated ? ` • ${lastUpdated}` : ''}</div>
        </div>
      `;
  
      container.innerHTML = fullHtml;
  
      // Attach event listener to the dropdown
      const select = document.getElementById('metric-select');
      if (select) {
        console.log("Metric dropdown attached:", select);
        console.log("Current metric =", metric);
          
        select.addEventListener('change', () => {
          const selectedMetric = select.value;
          console.log("Metric dropdown changed to:", selectedMetric);
          currentMetric = selectedMetric;
          console.log("Leaderboard rerender triggered with metric:", currentMetric);
          renderLeaderboard(currentMetric);
        });
      }
    } else {
      // Update only the table content, preserve the dropdown
      const tableHtml = `
        <div class="wc-row wc-head">
          <div class="wc-col rank">Rank</div>
          <div class="wc-col hub">Hub</div>
          <div class="wc-col metric">${headerMetricLabel}</div>
          <div class="wc-col change">${headerChangeLabel}</div>
        </div>
        ${sorted
          .map((entry, idx) => {
            const rank = idx + 1;
            const value = getDisplayValue(entry, metric);
            const change = calculateChange(entry, metric);
            const changeSign = change > 0 ? '▲' : change < 0 ? '▼' : '—';
            const changeClass =
              change > 0 ? 'wc-up' : change < 0 ? 'wc-down' : 'wc-flat';
            const logo =
              entry.logo || LOGO_MAP[entry.region] || 'assets/watermark/wtfman.png';
            const tagline =
              entry.tagline ||
              'Global hub of the WTF Network.';
            const hubLink = HUB_LINKS[entry.region] || '#';
            const isClickable = HUB_LINKS[entry.region] ? true : false;
  
            return `
            <div class="wc-row wc-body wc-animate">
              <div class="wc-col rank">${rankBadge(rank)} ${rank}</div>
              <div class="wc-col hub">
                <div class="wc-hub">
                  <img class="wc-logo" src="${logo}" alt="${entry.region}" onerror="this.style.display='none'"/>
                  <div class="wc-meta">
                    <div class="wc-name">
                      ${isClickable 
                        ? `<a href="${hubLink}" class="wc-hub-link"><strong>${entry.region}</strong></a>` 
                        : `<strong>${entry.region}</strong>`
                      }
                    </div>
                    <div class="wc-tag">${tagline}</div>
                  </div>
                </div>
              </div>
              <div class="wc-col metric">
                <div class="wc-value">${formatNumber(value)}</div>
              </div>
              <div class="wc-col change">
                <div class="wc-change ${changeClass}">
                  ${changeSign} ${formatNumber(Math.abs(change))}
                </div>
              </div>
            </div>`;
          })
          .join('')}
      `;
  
      // Update the table content
      const tableElement = document.getElementById(TABLE_ID);
      if (tableElement) {
        // Simple update without fade effect for now to avoid complications
        tableElement.innerHTML = tableHtml;
      }
  
      // Update the dropdown selection to match the current metric
      const select = document.getElementById('metric-select');
      if (select) {
        select.value = metric;
      }
        
      // Update active events banner
      updateActiveEventsBanner(activeEvents);
    }
  
    console.log(
      `✅ World Cup v4.5 loaded | Metric: ${METRIC_LABELS[metric]} | Regions: ${sorted.length}`
    );
  }

  function injectStyles() {
    const css = `
      .wc-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 1rem;
      }
      .wc-title { font-size: 1.25rem; font-weight: 700; color: var(--color-gold); }
      .wc-select {
        background: rgba(0,0,0,0.6); color: var(--color-text);
        border: 1px solid rgba(212,175,55,0.4);
        padding: 0.35rem 0.5rem; border-radius: 8px; outline: none;
      }
      .wc-table-wrapper { width: 100%; }
      .wc-table { display: grid; gap: 0.5rem; }
      .wc-row { display: grid; grid-template-columns: 80px 1fr 160px 140px; align-items: center; }
      .wc-head { font-weight: 700; opacity: 0.85; }
      .wc-body {
        background: rgba(0,0,0,0.35); border: 1px solid rgba(212,175,55,0.25);
        border-radius: 12px; padding: 0.75rem; transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .wc-body:hover { transform: translateY(-2px); box-shadow: 0 0 18px rgba(212,175,55,0.15); }
      .wc-hub { display: flex; align-items: center; gap: 0.75rem; }
      .wc-logo { width: 42px; height: 42px; border-radius: 6px; object-fit: cover; }
      .wc-name { color: var(--color-text); }
      .wc-hub-link { 
        color: var(--color-gold); 
        text-decoration: none; 
        transition: all 0.2s ease;
        display: inline-block;
      }
      .wc-hub-link:hover { 
        color: #f4d03f; 
        text-shadow: 0 0 8px rgba(212,175,55,0.4);
        transform: translateX(2px);
      }
      .wc-tag { font-size: 0.85rem; opacity: 0.7; }
      .wc-value { color: var(--color-gold); font-weight: 700; }
      .wc-change { font-weight: 600; }
      .wc-up { color: #4ade80; } .wc-down { color: #f87171; } .wc-flat { opacity: 0.6; }
      .wc-footer { display: flex; justify-content: flex-end; margin-top: 0.75rem; }
      .wc-updated { font-size: 0.85rem; opacity: 0.7; }

      .wc-animate { transition: transform 0.25s ease, opacity 0.25s ease; }
      .wc-fade-out { opacity: 0; }
      .wc-fade-in { opacity: 1; }

      @media (max-width: 480px) {
        .wc-row { grid-template-columns: 60px 1fr; grid-row-gap: 0.5rem; }
        .wc-col.metric, .wc-col.change { grid-column: 1 / span 2; }
        .wc-logo { width: 36px; height: 36px; }
      }
    `;
    const style = document.createElement('style');
    style.id = 'wc-styles-v43';
    style.textContent = css;
    document.head.appendChild(style);
  }

  async function init() {
    injectStyles();
    await loadWorldCupData();
    renderLeaderboard(currentMetric);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();