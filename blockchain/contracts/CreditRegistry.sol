// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

/**
 * @title CreditRegistry
 * @notice Tracks credit scores and payment history for all participants
 * @dev Credit scores range from 0-1000, updated deterministically on-chain
 */
contract CreditRegistry {
    // Constants
    uint256 public constant BASE_CREDIT_SCORE = 300;
    uint256 public constant MAX_CREDIT_SCORE = 1000;
    uint256 public constant MIN_CREDIT_SCORE = 0;
    
    // Credit score adjustment constants
    uint256 public constant ON_TIME_PAYMENT_BONUS = 10;
    uint256 public constant LATE_PAYMENT_PENALTY = 20;
    uint256 public constant DEFAULT_PENALTY = 100;
    uint256 public constant CIRCLE_COMPLETION_BONUS = 15;

    struct CreditProfile {
        uint256 creditScore;
        uint256 circlesJoined;
        uint256 circlesCompleted;
        uint256 onTimePayments;
        uint256 latePayments;
        uint256 defaults;
        bool hasDefaulted;
    }

    mapping(address => CreditProfile) public creditProfiles;
    mapping(address => bool) public hasProfile;

    // Events
    event CreditScoreUpdated(address indexed participant, uint256 newScore, uint256 previousScore);
    event OnTimePaymentRecorded(address indexed participant, uint256 newScore);
    event LatePaymentRecorded(address indexed participant, uint256 newScore);
    event DefaultRecorded(address indexed participant, uint256 newScore);
    event CircleCompletionRecorded(address indexed participant, uint256 newScore);
    event ProfileCreated(address indexed participant, uint256 initialScore);

    /**
     * @notice Get credit score for an address
     * @param participant Address to query
     * @return Credit score (0-1000)
     */
    function getCreditScore(address participant) public view returns (uint256) {
        if (!hasProfile[participant]) {
            return BASE_CREDIT_SCORE;
        }
        return creditProfiles[participant].creditScore;
    }

    /**
     * @notice Get full credit profile for an address
     * @param participant Address to query
     * @return profile CreditProfile struct
     */
    function getCreditProfile(address participant) public view returns (CreditProfile memory profile) {
        if (!hasProfile[participant]) {
            return CreditProfile({
                creditScore: BASE_CREDIT_SCORE,
                circlesJoined: 0,
                circlesCompleted: 0,
                onTimePayments: 0,
                latePayments: 0,
                defaults: 0,
                hasDefaulted: false
            });
        }
        return creditProfiles[participant];
    }

    /**
     * @notice Record an on-time payment
     * @param participant Address that made the payment
     */
    function recordOnTimePayment(address participant) external {
        _ensureProfile(participant);
        
        uint256 previousScore = creditProfiles[participant].creditScore;
        creditProfiles[participant].onTimePayments++;
        
        // Increase credit score, capped at MAX_CREDIT_SCORE
        uint256 newScore = previousScore + ON_TIME_PAYMENT_BONUS;
        if (newScore > MAX_CREDIT_SCORE) {
            newScore = MAX_CREDIT_SCORE;
        }
        
        creditProfiles[participant].creditScore = newScore;
        
        emit OnTimePaymentRecorded(participant, newScore);
        emit CreditScoreUpdated(participant, newScore, previousScore);
    }

    /**
     * @notice Record a late payment
     * @param participant Address that made a late payment
     */
    function recordLatePayment(address participant) external {
        _ensureProfile(participant);
        
        uint256 previousScore = creditProfiles[participant].creditScore;
        creditProfiles[participant].latePayments++;
        
        // Decrease credit score, floored at MIN_CREDIT_SCORE
        uint256 newScore = previousScore >= LATE_PAYMENT_PENALTY 
            ? previousScore - LATE_PAYMENT_PENALTY 
            : MIN_CREDIT_SCORE;
        
        creditProfiles[participant].creditScore = newScore;
        
        emit LatePaymentRecorded(participant, newScore);
        emit CreditScoreUpdated(participant, newScore, previousScore);
    }

    /**
     * @notice Record a default
     * @param participant Address that defaulted
     */
    function recordDefault(address participant) external {
        _ensureProfile(participant);
        
        uint256 previousScore = creditProfiles[participant].creditScore;
        creditProfiles[participant].defaults++;
        creditProfiles[participant].hasDefaulted = true;
        
        // Heavy penalty for default
        uint256 newScore = previousScore >= DEFAULT_PENALTY 
            ? previousScore - DEFAULT_PENALTY 
            : MIN_CREDIT_SCORE;
        
        creditProfiles[participant].creditScore = newScore;
        
        emit DefaultRecorded(participant, newScore);
        emit CreditScoreUpdated(participant, newScore, previousScore);
    }

    /**
     * @notice Record circle completion
     * @param participant Address that completed a circle
     */
    function recordCircleCompletion(address participant) external {
        _ensureProfile(participant);
        
        uint256 previousScore = creditProfiles[participant].creditScore;
        creditProfiles[participant].circlesCompleted++;
        
        // Bonus for completing a circle
        uint256 newScore = previousScore + CIRCLE_COMPLETION_BONUS;
        if (newScore > MAX_CREDIT_SCORE) {
            newScore = MAX_CREDIT_SCORE;
        }
        
        creditProfiles[participant].creditScore = newScore;
        
        emit CircleCompletionRecorded(participant, newScore);
        emit CreditScoreUpdated(participant, newScore, previousScore);
    }

    /**
     * @notice Record joining a circle (internal, called by LendingCircle)
     * @param participant Address joining a circle
     */
    function recordCircleJoin(address participant) external {
        _ensureProfile(participant);
        creditProfiles[participant].circlesJoined++;
    }

    /**
     * @notice Internal function to ensure a profile exists
     * @param participant Address to check/create profile for
     */
    function _ensureProfile(address participant) internal {
        if (!hasProfile[participant]) {
            creditProfiles[participant] = CreditProfile({
                creditScore: BASE_CREDIT_SCORE,
                circlesJoined: 0,
                circlesCompleted: 0,
                onTimePayments: 0,
                latePayments: 0,
                defaults: 0,
                hasDefaulted: false
            });
            hasProfile[participant] = true;
            emit ProfileCreated(participant, BASE_CREDIT_SCORE);
        }
    }
}
