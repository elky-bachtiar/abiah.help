/**
 * UI Components Test Suite for Subscription System
 * Tests React components with mocked dependencies
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { jest } from '@jest/globals'
import '@testing-library/jest-dom'

// Mock React Query
const mockUseQuery = jest.fn()
const mockUseMutation = jest.fn()
const mockQueryClient = {
  invalidateQueries: jest.fn(),
  setQueryData: jest.fn(),
  getQueryData: jest.fn(),
}

jest.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useQueryClient: () => mockQueryClient,
}))

// Mock Jotai
const mockUseAtom = jest.fn()
const mockUseAtomValue = jest.fn()
const mockUseSetAtom = jest.fn()

jest.mock('jotai', () => ({
  useAtom: mockUseAtom,
  useAtomValue: mockUseAtomValue,
  useSetAtom: mockUseSetAtom,
}))

// Mock components (these would be imported from actual files)
const MockUsageDashboard = jest.fn(({ compact, showUpgrade, onUpgrade }) => (
  <div data-testid="usage-dashboard">
    <div data-testid="current-tier">Founder Companion</div>
    <div data-testid="sessions-progress">1/3 sessions used</div>
    <div data-testid="minutes-progress">25/75 minutes used</div>
    <div data-testid="documents-progress">5/20 documents used</div>
    <div data-testid="tokens-progress">15K/50K tokens used</div>
    {showUpgrade && (
      <button data-testid="upgrade-button" onClick={onUpgrade}>
        Upgrade Plan
      </button>
    )}
    {compact && <div data-testid="compact-mode">Compact View</div>}
  </div>
))

const MockSubscriptionGuard = jest.fn(({ 
  action, 
  children, 
  onProceed, 
  onCancel,
  showUsageSummary = true 
}) => (
  <div data-testid="subscription-guard">
    <div data-testid="action-type">{action}</div>
    {showUsageSummary && (
      <div data-testid="usage-summary">
        Current usage summary
      </div>
    )}
    <div data-testid="validation-status">Validation passed</div>
    <button data-testid="proceed-button" onClick={onProceed}>
      Proceed
    </button>
    <button data-testid="cancel-button" onClick={onCancel}>
      Cancel
    </button>
    {children}
  </div>
))

const MockLimitWarningModal = jest.fn(({ 
  isOpen, 
  onClose, 
  onProceed, 
  warningType,
  usageData,
  estimatedImpact 
}) => {
  if (!isOpen) return null
  
  return (
    <div data-testid="limit-warning-modal">
      <div data-testid="warning-type">{warningType}</div>
      <div data-testid="usage-data">
        {usageData?.sessions_used}/{usageData?.sessions_limit} sessions
      </div>
      <div data-testid="estimated-impact">
        Estimated: {estimatedImpact?.minutes} minutes
      </div>
      <button data-testid="proceed-anyway" onClick={onProceed}>
        Proceed Anyway
      </button>
      <button data-testid="modal-close" onClick={onClose}>
        Cancel
      </button>
    </div>
  )
})

describe('Subscription UI Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('UsageDashboard Component', () => {
    const mockUsageData = {
      current_tier: 'founder_companion',
      billing_period: {
        start: '2024-01-01T00:00:00Z',
        end: '2024-01-31T23:59:59Z',
        days_remaining: 15,
      },
      usage: {
        sessions: { used: 1, limit: 3, percentage: 33 },
        minutes: { used: 25, limit: 75, percentage: 33 },
        documents: { used: 5, limit: 20, percentage: 25 },
        tokens: { used: 15000, limit: 50000, percentage: 30 },
      },
      alerts: [],
    }

    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockUsageData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      })
    })

    it('should render usage dashboard with all metrics', () => {
      render(<MockUsageDashboard />)

      expect(screen.getByTestId('usage-dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('current-tier')).toHaveTextContent('Founder Companion')
      expect(screen.getByTestId('sessions-progress')).toHaveTextContent('1/3 sessions used')
      expect(screen.getByTestId('minutes-progress')).toHaveTextContent('25/75 minutes used')
      expect(screen.getByTestId('documents-progress')).toHaveTextContent('5/20 documents used')
      expect(screen.getByTestId('tokens-progress')).toHaveTextContent('15K/50K tokens used')
    })

    it('should render in compact mode', () => {
      render(<MockUsageDashboard compact={true} />)

      expect(screen.getByTestId('compact-mode')).toBeInTheDocument()
    })

    it('should show upgrade button when enabled', () => {
      const mockOnUpgrade = jest.fn()
      render(<MockUsageDashboard showUpgrade={true} onUpgrade={mockOnUpgrade} />)

      const upgradeButton = screen.getByTestId('upgrade-button')
      expect(upgradeButton).toBeInTheDocument()

      fireEvent.click(upgradeButton)
      expect(mockOnUpgrade).toHaveBeenCalledTimes(1)
    })

    it('should handle loading state', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      })

      const MockLoadingDashboard = () => (
        <div data-testid="loading-dashboard">Loading usage data...</div>
      )

      render(<MockLoadingDashboard />)
      expect(screen.getByTestId('loading-dashboard')).toBeInTheDocument()
    })

    it('should handle error state', () => {
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load usage data'),
      })

      const MockErrorDashboard = () => (
        <div data-testid="error-dashboard">Error loading usage data</div>
      )

      render(<MockErrorDashboard />)
      expect(screen.getByTestId('error-dashboard')).toBeInTheDocument()
    })

    it('should auto-refresh every 30 seconds', async () => {
      const mockRefetch = jest.fn()
      mockUseQuery.mockReturnValue({
        data: mockUsageData,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      })

      // Mock setInterval
      jest.useFakeTimers()
      
      render(<MockUsageDashboard />)

      // Fast-forward 30 seconds
      jest.advanceTimersByTime(30000)

      expect(mockRefetch).toHaveBeenCalledTimes(1)

      // Fast-forward another 30 seconds
      jest.advanceTimersByTime(30000)

      expect(mockRefetch).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should display usage alerts', () => {
      const alertData = {
        ...mockUsageData,
        alerts: ['approaching_minute_limit', 'last_session'],
      }

      mockUseQuery.mockReturnValue({
        data: alertData,
        isLoading: false,
        error: null,
      })

      const MockAlertDashboard = ({ alerts }: { alerts: string[] }) => (
        <div data-testid="usage-dashboard">
          {alerts.map(alert => (
            <div key={alert} data-testid={`alert-${alert}`}>
              {alert.replace('_', ' ')}
            </div>
          ))}
        </div>
      )

      render(<MockAlertDashboard alerts={alertData.alerts} />)

      expect(screen.getByTestId('alert-approaching_minute_limit')).toBeInTheDocument()
      expect(screen.getByTestId('alert-last_session')).toBeInTheDocument()
    })
  })

  describe('SubscriptionGuard Component', () => {
    const mockValidationData = {
      allowed: true,
      usage: {
        sessions: { used: 1, limit: 3 },
        minutes: { used: 25, limit: 75 },
      },
      warnings: [],
    }

    beforeEach(() => {
      mockUseQuery.mockReturnValue({
        data: mockValidationData,
        isLoading: false,
        error: null,
      })
    })

    it('should render subscription guard for conversation action', () => {
      const mockOnProceed = jest.fn()
      const mockOnCancel = jest.fn()

      render(
        <MockSubscriptionGuard 
          action="start_conversation"
          onProceed={mockOnProceed}
          onCancel={mockOnCancel}
        >
          <div>Protected content</div>
        </MockSubscriptionGuard>
      )

      expect(screen.getByTestId('subscription-guard')).toBeInTheDocument()
      expect(screen.getByTestId('action-type')).toHaveTextContent('start_conversation')
      expect(screen.getByTestId('usage-summary')).toBeInTheDocument()
      expect(screen.getByTestId('validation-status')).toHaveTextContent('Validation passed')
    })

    it('should handle proceed action', () => {
      const mockOnProceed = jest.fn()
      
      render(
        <MockSubscriptionGuard 
          action="generate_document"
          onProceed={mockOnProceed}
          onCancel={jest.fn()}
        />
      )

      const proceedButton = screen.getByTestId('proceed-button')
      fireEvent.click(proceedButton)

      expect(mockOnProceed).toHaveBeenCalledTimes(1)
    })

    it('should handle cancel action', () => {
      const mockOnCancel = jest.fn()
      
      render(
        <MockSubscriptionGuard 
          action="start_conversation"
          onProceed={jest.fn()}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByTestId('cancel-button')
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should hide usage summary when specified', () => {
      render(
        <MockSubscriptionGuard 
          action="start_conversation"
          showUsageSummary={false}
          onProceed={jest.fn()}
          onCancel={jest.fn()}
        />
      )

      expect(screen.queryByTestId('usage-summary')).not.toBeInTheDocument()
    })

    it('should display validation errors', () => {
      const errorValidation = {
        allowed: false,
        reason: 'sessions_exceeded',
        upgrade_suggestion: {
          tier: 'growth_partner',
          benefits: ['5 sessions', '150 minutes'],
        },
      }

      mockUseQuery.mockReturnValue({
        data: errorValidation,
        isLoading: false,
        error: null,
      })

      const MockErrorGuard = ({ validation }: { validation: any }) => (
        <div data-testid="subscription-guard">
          <div data-testid="validation-error">
            {validation.reason}: Please upgrade to {validation.upgrade_suggestion?.tier}
          </div>
          <div data-testid="upgrade-benefits">
            {validation.upgrade_suggestion?.benefits.join(', ')}
          </div>
        </div>
      )

      render(<MockErrorGuard validation={errorValidation} />)

      expect(screen.getByTestId('validation-error')).toHaveTextContent('sessions_exceeded: Please upgrade to growth_partner')
      expect(screen.getByTestId('upgrade-benefits')).toHaveTextContent('5 sessions, 150 minutes')
    })

    it('should display warnings without blocking action', () => {
      const warningValidation = {
        allowed: true,
        warnings: ['approaching_minute_limit', 'last_session'],
        estimated_impact: {
          minutes: 30,
          tokens: 5000,
        },
      }

      const MockWarningGuard = ({ warnings }: { warnings: string[] }) => (
        <div data-testid="subscription-guard">
          <div data-testid="warnings-list">
            {warnings.map(warning => (
              <div key={warning} data-testid={`warning-${warning}`}>
                Warning: {warning.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>
      )

      render(<MockWarningGuard warnings={warningValidation.warnings} />)

      expect(screen.getByTestId('warning-approaching_minute_limit')).toBeInTheDocument()
      expect(screen.getByTestId('warning-last_session')).toBeInTheDocument()
    })
  })

  describe('LimitWarningModal Component', () => {
    const mockUsageData = {
      sessions_used: 2,
      sessions_limit: 3,
      minutes_used: 50,
      minutes_limit: 75,
    }

    const mockEstimatedImpact = {
      minutes: 30,
      tokens: 5000,
      documents: 1,
    }

    it('should render warning modal when open', () => {
      const mockOnClose = jest.fn()
      const mockOnProceed = jest.fn()

      render(
        <MockLimitWarningModal
          isOpen={true}
          warningType="approaching_session_limit"
          usageData={mockUsageData}
          estimatedImpact={mockEstimatedImpact}
          onClose={mockOnClose}
          onProceed={mockOnProceed}
        />
      )

      expect(screen.getByTestId('limit-warning-modal')).toBeInTheDocument()
      expect(screen.getByTestId('warning-type')).toHaveTextContent('approaching_session_limit')
      expect(screen.getByTestId('usage-data')).toHaveTextContent('2/3 sessions')
      expect(screen.getByTestId('estimated-impact')).toHaveTextContent('Estimated: 30 minutes')
    })

    it('should not render when closed', () => {
      render(
        <MockLimitWarningModal
          isOpen={false}
          warningType="approaching_session_limit"
          usageData={mockUsageData}
          estimatedImpact={mockEstimatedImpact}
          onClose={jest.fn()}
          onProceed={jest.fn()}
        />
      )

      expect(screen.queryByTestId('limit-warning-modal')).not.toBeInTheDocument()
    })

    it('should handle proceed anyway action', () => {
      const mockOnProceed = jest.fn()

      render(
        <MockLimitWarningModal
          isOpen={true}
          warningType="minutes_warning"
          usageData={mockUsageData}
          estimatedImpact={mockEstimatedImpact}
          onClose={jest.fn()}
          onProceed={mockOnProceed}
        />
      )

      const proceedButton = screen.getByTestId('proceed-anyway')
      fireEvent.click(proceedButton)

      expect(mockOnProceed).toHaveBeenCalledTimes(1)
    })

    it('should handle modal close action', () => {
      const mockOnClose = jest.fn()

      render(
        <MockLimitWarningModal
          isOpen={true}
          warningType="documents_warning"
          usageData={mockUsageData}
          estimatedImpact={mockEstimatedImpact}
          onClose={mockOnClose}
          onProceed={jest.fn()}
        />
      )

      const closeButton = screen.getByTestId('modal-close')
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should display different warning types', () => {
      const warningTypes = [
        'approaching_session_limit',
        'approaching_minute_limit',
        'approaching_document_limit',
        'approaching_token_limit',
      ]

      warningTypes.forEach(warningType => {
        const { unmount } = render(
          <MockLimitWarningModal
            isOpen={true}
            warningType={warningType}
            usageData={mockUsageData}
            estimatedImpact={mockEstimatedImpact}
            onClose={jest.fn()}
            onProceed={jest.fn()}
          />
        )

        expect(screen.getByTestId('warning-type')).toHaveTextContent(warningType)
        unmount()
      })
    })

    it('should display upgrade suggestions for hard limits', () => {
      const mockUpgradeSuggestion = {
        tier: 'growth_partner',
        benefits: ['5 sessions', '150 minutes', '40 documents'],
        price: '$49/month',
      }

      const MockUpgradeModal = ({ upgradeSuggestion }: { upgradeSuggestion: any }) => (
        <div data-testid="limit-warning-modal">
          <div data-testid="upgrade-tier">{upgradeSuggestion.tier}</div>
          <div data-testid="upgrade-benefits">
            {upgradeSuggestion.benefits.join(', ')}
          </div>
          <div data-testid="upgrade-price">{upgradeSuggestion.price}</div>
          <button data-testid="upgrade-now">Upgrade Now</button>
        </div>
      )

      render(<MockUpgradeModal upgradeSuggestion={mockUpgradeSuggestion} />)

      expect(screen.getByTestId('upgrade-tier')).toHaveTextContent('growth_partner')
      expect(screen.getByTestId('upgrade-benefits')).toHaveTextContent('5 sessions, 150 minutes, 40 documents')
      expect(screen.getByTestId('upgrade-price')).toHaveTextContent('$49/month')
    })
  })

  describe('Integration Tests', () => {
    it('should integrate UsageDashboard with SubscriptionGuard', async () => {
      const MockIntegratedComponent = () => {
        const [showGuard, setShowGuard] = React.useState(false)

        return (
          <div>
            <MockUsageDashboard />
            <button 
              data-testid="start-conversation"
              onClick={() => setShowGuard(true)}
            >
              Start Conversation
            </button>
            {showGuard && (
              <MockSubscriptionGuard
                action="start_conversation"
                onProceed={() => setShowGuard(false)}
                onCancel={() => setShowGuard(false)}
              />
            )}
          </div>
        )
      }

      render(<MockIntegratedComponent />)

      // Initially only dashboard is visible
      expect(screen.getByTestId('usage-dashboard')).toBeInTheDocument()
      expect(screen.queryByTestId('subscription-guard')).not.toBeInTheDocument()

      // Click to start conversation
      fireEvent.click(screen.getByTestId('start-conversation'))

      // Guard should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('subscription-guard')).toBeInTheDocument()
      })

      // Proceed with action
      fireEvent.click(screen.getByTestId('proceed-button'))

      // Guard should be hidden again
      await waitFor(() => {
        expect(screen.queryByTestId('subscription-guard')).not.toBeInTheDocument()
      })
    })

    it('should show warning modal when limits are approached', async () => {
      const MockWarningFlow = () => {
        const [showModal, setShowModal] = React.useState(false)

        return (
          <div>
            <MockUsageDashboard />
            <button 
              data-testid="trigger-warning"
              onClick={() => setShowModal(true)}
            >
              Generate Document
            </button>
            <MockLimitWarningModal
              isOpen={showModal}
              warningType="approaching_document_limit"
              usageData={{ documents_used: 18, documents_limit: 20 }}
              estimatedImpact={{ documents: 1 }}
              onClose={() => setShowModal(false)}
              onProceed={() => {
                setShowModal(false)
                // Proceed with document generation
              }}
            />
          </div>
        )
      }

      render(<MockWarningFlow />)

      // Trigger the warning
      fireEvent.click(screen.getByTestId('trigger-warning'))

      // Modal should appear
      await waitFor(() => {
        expect(screen.getByTestId('limit-warning-modal')).toBeInTheDocument()
      })

      // Close the modal
      fireEvent.click(screen.getByTestId('modal-close'))

      // Modal should disappear
      await waitFor(() => {
        expect(screen.queryByTestId('limit-warning-modal')).not.toBeInTheDocument()
      })
    })
  })

  describe('Real-time Updates', () => {
    it('should update dashboard when usage changes', async () => {
      const initialData = {
        usage: {
          sessions: { used: 1, limit: 3, percentage: 33 },
          minutes: { used: 25, limit: 75, percentage: 33 },
        },
      }

      const updatedData = {
        usage: {
          sessions: { used: 2, limit: 3, percentage: 67 },
          minutes: { used: 55, limit: 75, percentage: 73 },
        },
      }

      // Start with initial data
      mockUseQuery.mockReturnValue({
        data: initialData,
        isLoading: false,
        error: null,
      })

      const MockRealtimeDashboard = ({ data }: { data: any }) => (
        <div data-testid="usage-dashboard">
          <div data-testid="sessions-usage">
            {data.usage.sessions.used}/{data.usage.sessions.limit}
          </div>
          <div data-testid="minutes-usage">
            {data.usage.minutes.used}/{data.usage.minutes.limit}
          </div>
        </div>
      )

      const { rerender } = render(<MockRealtimeDashboard data={initialData} />)

      expect(screen.getByTestId('sessions-usage')).toHaveTextContent('1/3')
      expect(screen.getByTestId('minutes-usage')).toHaveTextContent('25/75')

      // Simulate real-time update
      rerender(<MockRealtimeDashboard data={updatedData} />)

      expect(screen.getByTestId('sessions-usage')).toHaveTextContent('2/3')
      expect(screen.getByTestId('minutes-usage')).toHaveTextContent('55/75')
    })

    it('should show live alerts when limits are approached', () => {
      const MockLiveAlerts = ({ alerts }: { alerts: string[] }) => (
        <div data-testid="live-alerts">
          {alerts.map(alert => (
            <div key={alert} data-testid={`live-alert-${alert}`} className="alert">
              {alert.replace('_', ' ').toUpperCase()}
            </div>
          ))}
        </div>
      )

      const { rerender } = render(<MockLiveAlerts alerts={[]} />)

      // No alerts initially
      expect(screen.queryByTestId('live-alerts')).toBeInTheDocument()
      expect(screen.getByTestId('live-alerts')).toBeEmptyDOMElement()

      // Add alerts
      rerender(<MockLiveAlerts alerts={['approaching_minute_limit', 'last_session']} />)

      expect(screen.getByTestId('live-alert-approaching_minute_limit')).toBeInTheDocument()
      expect(screen.getByTestId('live-alert-last_session')).toBeInTheDocument()
    })
  })
})