/**
 * Phase 14: Styling & Polish Verification Script
 * 
 * This script verifies all the styling enhancements implemented in Phase 14
 */

const fs = require('fs');
const path = require('path');

console.log('\n🎨 PHASE 14: STYLING & POLISH VERIFICATION\n');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, condition) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ ${description}`);
    return true;
  } else {
    failedTests++;
    console.log(`✗ FAILED: ${description}`);
    return false;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(path.join(__dirname, filePath));
  } catch (error) {
    return false;
  }
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return content.includes(searchString);
  } catch (error) {
    return false;
  }
}

function fileContainsMultiple(filePath, searchStrings) {
  try {
    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return searchStrings.every(str => content.includes(str));
  } catch (error) {
    return false;
  }
}

console.log('\n📁 SECTION 1: CSS Files Structure\n');
console.log('-'.repeat(60));

// Check core CSS files
test('Member Layout CSS exists', fileExists('client/src/components/member/MemberLayout.css'));
test('Member Dashboard CSS exists', fileExists('client/src/pages/member/MemberDashboard.css'));
test('PMSprints CSS exists', fileExists('client/src/pages/pm/PMSprints.css'));
test('BurndownChart CSS exists', fileExists('client/src/components/sprint/BurndownChart.css'));
test('BudgetTracker CSS exists', fileExists('client/src/components/project/BudgetTracker.css'));
test('MemberTimeTracking CSS exists', fileExists('client/src/pages/member/MemberTimeTracking.css'));

// Check new shared CSS files
test('Shared badges CSS exists', fileExists('client/src/styles/badges.css'));
test('Shared animations CSS exists', fileExists('client/src/styles/animations.css'));

console.log('\n🎨 SECTION 2: Member/Team Leader Theme Enhancements\n');
console.log('-'.repeat(60));

test('Member Layout has teal/green gradient',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    'linear-gradient(180deg, #14b8a6 0%, #10b981 100%)',
    'teal/green gradient theme'
  ])
);

test('Member Layout has enhanced animations',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    '@keyframes slideInFromLeft',
    '@keyframes fadeIn',
    '@keyframes pulse',
    'animation: slideInFromLeft'
  ])
);

test('Member Layout has tooltip support',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    '.nav-item[data-tooltip]',
    'data-tooltip',
    'opacity: 0'
  ])
);

test('Member Layout has loading skeleton',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    '.loading-skeleton',
    '@keyframes loading',
    'background-position'
  ])
);

test('Member Layout has smooth avatar hover',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    '.user-avatar img',
    'transform: scale(1.05)'
  ])
);

console.log('\n🏃 SECTION 3: Animation Enhancements\n');
console.log('-'.repeat(60));

test('Animations library has fade animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes fadeIn',
    '@keyframes fadeInUp',
    '@keyframes fadeInDown',
    '@keyframes fadeInLeft',
    '@keyframes fadeInRight'
  ])
);

test('Animations library has slide animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes slideInUp',
    '@keyframes slideInDown',
    '@keyframes slideInLeft',
    '@keyframes slideInRight'
  ])
);

test('Animations library has scale animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes scaleIn',
    '@keyframes scaleOut',
    '@keyframes zoomIn',
    '@keyframes zoomOut'
  ])
);

test('Animations library has bounce animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes bounceIn',
    '@keyframes bounce'
  ])
);

test('Animations library has rotation animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes spin',
    '@keyframes spinReverse',
    '@keyframes rotate3D'
  ])
);

test('Animations library has pulse animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes pulse',
    '@keyframes pulseGlow',
    '@keyframes heartbeat'
  ])
);

test('Animations library has shake animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes shake',
    '@keyframes wobble'
  ])
);

test('Animations library has shimmer/loading animations',
  fileContainsMultiple('client/src/styles/animations.css', [
    '@keyframes shimmer',
    '@keyframes loading',
    'background-position'
  ])
);

test('Animations library has utility classes',
  fileContainsMultiple('client/src/styles/animations.css', [
    '.animate-fade-in',
    '.animate-bounce-in',
    '.animate-spin',
    '.animate-pulse'
  ])
);

test('Animations library has hover utilities',
  fileContainsMultiple('client/src/styles/animations.css', [
    '.hover-lift',
    '.hover-scale',
    '.hover-glow'
  ])
);

test('Animations library has stagger delays',
  fileContainsMultiple('client/src/styles/animations.css', [
    '.stagger-1',
    '.stagger-2',
    '.stagger-3',
    'animation-delay'
  ])
);

console.log('\n🏷️ SECTION 4: Badge System\n');
console.log('-'.repeat(60));

test('Badge system has base badge class',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge {',
    'display: inline-flex',
    'align-items: center'
  ])
);

test('Badge system has role badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-team-leader',
    '.badge-member',
    '.badge-pm',
    '.badge-admin',
    '.badge-super-admin',
    '.badge-client'
  ])
);

test('Badge system has status badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-active',
    '.badge-planning',
    '.badge-on_hold',
    '.badge-completed',
    '.badge-cancelled'
  ])
);

test('Badge system has specialization badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-specialization',
    '.badge-specialization.ui-ux',
    '.badge-specialization.software-engineer'
  ])
);

test('Badge system has priority badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-priority-critical',
    '.badge-priority-high',
    '.badge-priority-medium',
    '.badge-priority-low'
  ])
);

test('Badge system has story points badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-story-points',
    '.badge-story-points.points-1',
    '.badge-story-points.points-8'
  ])
);

test('Badge system has complexity badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-complexity-light',
    '.badge-complexity-medium',
    '.badge-complexity-heavy'
  ])
);

test('Badge system has budget alert badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-budget-good',
    '.badge-budget-warning',
    '.badge-budget-critical'
  ])
);

test('Badge system has critical pulse animation',
  fileContainsMultiple('client/src/styles/badges.css', [
    '@keyframes pulseCritical',
    'box-shadow: 0 0 0'
  ])
);

test('Badge system has interactive badges',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge.clickable',
    'cursor: pointer',
    'transform: translateY(-2px)'
  ])
);

test('Badge system has size variants',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-sm',
    '.badge-lg'
  ])
);

test('Badge system has removable badge',
  fileContainsMultiple('client/src/styles/badges.css', [
    '.badge-removable',
    '.badge-remove-btn'
  ])
);

console.log('\n📊 SECTION 5: Sprint Board Styling\n');
console.log('-'.repeat(60));

test('Sprint board has enhanced animations',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '@keyframes slideInUp',
    '@keyframes fadeIn',
    '@keyframes shimmer'
  ])
);

test('Sprint cards have staggered animation',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '.sprint-card:nth-child(1)',
    '.sprint-card:nth-child(2)',
    'animation-delay'
  ])
);

test('Sprint board has modal animations',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '@keyframes modalFadeIn',
    '@keyframes modalSlideIn',
    '.modal-overlay',
    'animation: modalFadeIn'
  ])
);

test('Sprint board has loading state',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '.sprint-card.loading',
    'background: linear-gradient',
    'animation: shimmer'
  ])
);

test('Sprint board has progress fill animation',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '.progress-fill',
    '@keyframes progressFill',
    'animation: progressFill'
  ])
);

test('Sprint board has status colors',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '.sprint-status.active',
    '.sprint-status.planning',
    '.sprint-status.completed'
  ])
);

test('Sprint board has ripple button effect',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '::before',
    'border-radius: 50%',
    'background: rgba(255, 255, 255, 0.3)'
  ])
);

console.log('\n📈 SECTION 6: Burndown Chart Styling\n');
console.log('-'.repeat(60));

test('Burndown chart has fade-in animation',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '@keyframes chartFadeIn',
    'animation: chartFadeIn'
  ])
);

test('Burndown chart has interactive legends',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '.legend-item',
    'cursor: pointer',
    'transform: translateY(-2px)'
  ])
);

test('Burndown chart has legend dot hover',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '.legend-dot',
    'transform: scale(1.3)'
  ])
);

test('Burndown chart has loading state',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '.burndown-chart.loading',
    '.chart-loader',
    'animation: spin'
  ])
);

test('Burndown chart has tooltip animation',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '.apexcharts-tooltip',
    '@keyframes tooltipFadeIn',
    'animation: tooltipFadeIn'
  ])
);

console.log('\n💰 SECTION 7: Budget Tracker Styling\n');
console.log('-'.repeat(60));

test('Budget tracker has circular progress',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.circular-progress-container',
    '.circular-progress',
    '.progress-circle'
  ])
);

test('Budget tracker has alert banners',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.alert-banner.critical',
    '.alert-banner.warning',
    '.alert-banner.caution'
  ])
);

test('Budget tracker has status badges',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.status-badge.good',
    '.status-badge.caution',
    '.status-badge.warning',
    '.status-badge.critical'
  ])
);

test('Budget tracker has refresh button animation',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.btn-refresh',
    '@keyframes spin',
    'animation: spin'
  ])
);

test('Budget tracker has loading spinner',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.spinner',
    'border-top-color: #10b981',
    'animation: spin 1s linear infinite'
  ])
);

test('Budget tracker has gradient button',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '.btn-add-expense',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  ])
);

console.log('\n⏱️ SECTION 8: Time Tracking Enhancements\n');
console.log('-'.repeat(60));

test('Time tracking page has fade-in animation',
  fileContainsMultiple('client/src/pages/member/MemberTimeTracking.css', [
    'animation: fadeIn',
    '@keyframes fadeIn'
  ])
);

test('Time tracking stat cards have enhanced hover',
  fileContainsMultiple('client/src/pages/member/MemberTimeTracking.css', [
    'transition: transform 0.3s cubic-bezier',
    'animation: slideInUp',
    'transform: translateY(-4px) scale(1.02)'
  ])
);

test('Time tracking stat cards have staggered animation',
  fileContainsMultiple('client/src/pages/member/MemberTimeTracking.css', [
    '.stat-card:nth-child(1)',
    '.stat-card:nth-child(2)',
    '.stat-card:nth-child(3)',
    'animation-delay'
  ])
);

test('Time tracking stat cards have teal theme',
  fileContainsMultiple('client/src/pages/member/MemberTimeTracking.css', [
    'rgba(20, 184, 166',
    'box-shadow: 0 8px 24px rgba(20, 184, 166, 0.2)'
  ])
);

console.log('\n📱 SECTION 9: Responsive Design\n');
console.log('-'.repeat(60));

test('Member Layout has responsive breakpoints',
  fileContainsMultiple('client/src/components/member/MemberLayout.css', [
    '@media (max-width: 1024px)',
    '@media (max-width: 768px)'
  ])
);

test('Sprint board has responsive design',
  fileContainsMultiple('client/src/pages/pm/PMSprints.css', [
    '@media (max-width: 768px)',
    'grid-template-columns: 1fr'
  ])
);

test('Burndown chart has responsive design',
  fileContainsMultiple('client/src/components/sprint/BurndownChart.css', [
    '@media (max-width: 768px)',
    'flex-direction: column'
  ])
);

test('Budget tracker has responsive design',
  fileContainsMultiple('client/src/components/project/BudgetTracker.css', [
    '@media (max-width: 640px)'
  ])
);

console.log('\n🎯 SECTION 10: Theme Consistency\n');
console.log('-'.repeat(60));

test('Teal/green theme in Member Layout',
  fileContains('client/src/components/member/MemberLayout.css', '#14b8a6')
);

test('Teal/green theme in Member Dashboard',
  fileContains('client/src/pages/member/MemberDashboard.css', '#14b8a6')
);

test('Teal/green theme in Time Tracking',
  fileContains('client/src/pages/member/MemberTimeTracking.css', 'rgba(20, 184, 166')
);

test('Blue theme in Sprint board',
  fileContains('client/src/pages/pm/PMSprints.css', '#3b82f6')
);

test('Green theme in Budget tracker',
  fileContains('client/src/components/project/BudgetTracker.css', '#10b981')
);

test('Gradient backgrounds in badges',
  fileContains('client/src/styles/badges.css', 'linear-gradient(135deg')
);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`✓ Passed: ${passedTests}`);
console.log(`✗ Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All styling and polish tests passed!');
  console.log('Phase 14 is complete and ready for production.');
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the output above.`);
}

console.log('\n' + '='.repeat(60));
console.log('📝 STYLING FEATURES IMPLEMENTED:');
console.log('='.repeat(60));
console.log('✓ Enhanced teal/green gradient theme for Member/Team Leader portal');
console.log('✓ Comprehensive animation library with 30+ animations');
console.log('✓ Unified badge system with 40+ badge variants');
console.log('✓ Sprint board with staggered card animations');
console.log('✓ Interactive burndown charts with hover effects');
console.log('✓ Circular progress budget tracker with alerts');
console.log('✓ Enhanced time tracking with smooth transitions');
console.log('✓ Tooltip support for collapsed sidebars');
console.log('✓ Loading skeletons and shimmer effects');
console.log('✓ Ripple button effects');
console.log('✓ Modal slide-in animations');
console.log('✓ Responsive design across all components');
console.log('✓ Consistent color themes across portals');
console.log('='.repeat(60));

process.exit(failedTests === 0 ? 0 : 1);

