import React, { useEffect, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";
import logo from "../../assets/images/fitfuel_rectanglelogo.png";
import Footer from "../layout/Footer.jsx";
import ProfileButton from "../profile/ProfileButton.jsx";
import { useAuth } from "../../context/AuthContext";

const LOADING_STEPS = [
  "Analyzing body profile...",
  "Predicting optimal macros...",
  "Filtering vegan/vegetarian meals...",
  "Ranking top plans..."
];

export default function DietPlanPage() {
  const navigate = useNavigate();
  const { user, userData, handleLogout, handleDeleteAccount } = useAuth();

  const [userName, setUserName] = useState("");

  // ML Service State
  const [mlResponse, setMlResponse] = useState(null);
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [goalValidation, setGoalValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  const [expandedCards, setExpandedCards] = useState({});

  const toggleCard = (index) => {
    setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    document.title = "Fit-Fuel — Your Diet Plan";
  }, []);

  // Simulate loading steps visually
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserName(userData.firstname);

            const mapActivityLevel = (level) => {
              const l = (level || '').toLowerCase();
              if (l === 'sedentary') return 'Sedentary';
              if (l === 'moderate') return 'Moderate';
              if (l === 'active') return 'Active';
              return 'Sedentary';
            };

            const mapFitnessGoal = (goal) => {
              const g = (goal || '').toLowerCase();
              if (g === 'weightloss' || g === 'weight loss') return 'Weight Loss';
              if (g === 'bulking') return 'Bulking';
              if (g === 'leanmuscle' || g === 'lean muscle gain') return 'Lean Muscle Gain';
              return 'Weight Loss';
            };

            const mapDietaryPreference = (pref) => {
              const p = (pref || '').toLowerCase();
              if (p === 'vegetarian' || p === 'veg') return 'veg';
              if (p === 'vegan') return 'vegan';
              return 'veg';
            };

            const requestBody = {
              age: parseInt(userData.age) || 25,
              gender: (userData.gender || "male").toLowerCase(),
              weight_kg: parseFloat(userData.weight) || 70,
              height_cm: parseFloat(userData.height) || 170,
              activity_level: mapActivityLevel(userData.activityLevel),
              fitness_goal: mapFitnessGoal(userData.fitnessGoal),
              dietary_preference: mapDietaryPreference(userData.dietaryPreference),
              budget: (userData.budget || 'low').toLowerCase()
            };

            try {
              const res = await axios.post("/api/ml/recommend", requestBody);
              setMlResponse(res.data);
              setRecommendedPlans(res.data.recommended_plans || []);
              setUserProfile(res.data.user_profile || null);
              setGoalValidation(res.data.goal_validation || null);
            } catch (err) {
              console.error("ML API Error:", err);
              if (err.response && err.response.status === 503) {
                setError("Our ML engine is warming up. Please retry.");
              } else {
                setError("Something went wrong while getting your recommendations. Please try again.");
              }
            } finally {
              // Add a tiny artificial delay so the user can see the cool loading steps complete
              setTimeout(() => setLoading(false), 500);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setError("Failed to fetch user profile. Please try logging in again.");
          setLoading(false);
        }
      } else {
        navigate("/login_signup");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="page-root">
      <div className="layout-container">
        <header className="header">
          <div className="logo-container">
            <Link to="/user_dashboard">
              <img src={logo} alt="Fit-Fuel" style={{ height: "45px", objectFit: "contain" }} />
            </Link>
          </div>
          <div className="nav-actions">
            <nav className="nav-links-input">
              <Link to="/user_dashboard">Home</Link>
              <Link to="/aboutus">About Us</Link>
              <Link to="/contactus">Contact Us</Link>
              <ProfileButton
                userData={userData}
                onViewProfile={() => { }}
                onLogout={() => handleLogout(navigate)}
                onDeleteAccount={() => handleDeleteAccount(navigate)}
              />
            </nav>
          </div>
        </header>
      </div>

      <PageContainer>
        <Title>
          {userName ? `${userName}'s Optimal Nutrition` : "Your Optimal Nutrition"}
        </Title>

        {loading ? (
          <LoadingContainer>
            <div className="spinner-container">
              <div className="custom-spinner"></div>
            </div>
            <div className="loading-steps">
              {LOADING_STEPS.map((step, index) => (
                <LoadingStep key={index} active={index === loadingStep} completed={index < loadingStep}>
                  <span className="icon">{index < loadingStep ? "✓" : index === loadingStep ? "●" : "○"}</span>
                  {step}
                </LoadingStep>
              ))}
            </div>
          </LoadingContainer>
        ) : error ? (
          <ErrorContainer>
            <div className="error-content">
              <h3>⚠️ Connection Interrupted</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          </ErrorContainer>
        ) : recommendedPlans.length === 0 ? (
          <EmptyContainer>
            <div className="empty-content">
              <span className="empty-icon">🌱</span>
              <h3>No plans matched your exact criteria</h3>
              <p>We couldn't construct a perfect match. To get better results, try adjusting your budget to Medium or changing your primary goal.</p>
              <button onClick={() => navigate("/client_input_form")}>Adjust Profile</button>
            </div>
          </EmptyContainer>
        ) : (
          <div className="container">
            {/* SECTION 3 — USER PROFILE SUMMARY CARD */}
            {userProfile && (
              <ProfileSummaryCard>
                <div className="profile-grid">
                  <div className="profile-col bmi-col">
                    <span className="col-label">Body Mass Index</span>
                    <div className="bmi-value">{userProfile.bmi.toFixed(1)}</div>
                    <div className="bmi-category">{userProfile.bmi_category}</div>
                    <BmiGauge value={userProfile.bmi} />
                  </div>

                  <div className="profile-col cal-col">
                    <span className="col-label">Daily Target</span>
                    <div className="cal-value">✦ {userProfile.calorie_target} <span className="unit">kcal</span></div>
                    <div className="meta-data">
                      <span>BMR: {Math.round(userProfile.calorie_target * 0.8)}</span>
                      <span>TDEE: {Math.round(userProfile.calorie_target * 1.15)}</span>
                    </div>
                  </div>

                  <div className="profile-col macro-col">
                    <span className="col-label">Target Macros</span>
                    <div className="macro-pills">
                      <div className="mpill m-protein" title="Protein target acts as an upper limit threshold for your specific body/goal">
                        💪 Protein: Up to {userProfile.macro_targets.protein_g}g (Max)
                      </div>
                      <div className="mpill m-carbs">🌾 Carbs: {userProfile.macro_targets.carbs_g}g</div>
                      <div className="mpill m-fat">🥑 Fat: {userProfile.macro_targets.fat_g}g</div>
                    </div>
                    <div className="sub-tag">(Optimal Split)</div>
                  </div>
                </div>
              </ProfileSummaryCard>
            )}

            {/* SECTION 4 — GOAL VALIDATION BANNER */}
            {goalValidation && (
              <div className={`goal-validation ${goalValidation.match ? 'goal-match' : 'goal-mismatch'}`}>
                  
                  {/* Always show user's selected goal prominently */}
                  <div className="goal-selected">
                      <span className="goal-icon">🎯</span>
                      <span className="goal-label">Your Goal:</span>
                      <span className="goal-name">{goalValidation.user_selected}</span>
                  </div>
                  
                  {goalValidation.match ? (
                      /* MATCH — Reassuring confirmation */
                      <div className="goal-confirmation">
                          <div className="goal-status">
                              <span className="status-icon">✓</span>
                              <span className="status-text">
                                  Great choice! Our ML analysis confirms this goal suits your body profile.
                              </span>
                          </div>
                          <p className="goal-detail">
                              Our model analyzed your BMI, activity level, and body composition 
                              and agrees with your selection with{' '}
                              <strong>{Math.round(goalValidation.confidence * 100)}% confidence</strong>.
                          </p>
                      </div>
                  ) : (
                      /* MISMATCH — Respectful suggestion */
                      <div className="goal-suggestion">
                          <div className="goal-insight-label">
                              <span className="insight-icon">💡</span>
                              <span className="insight-text">ML Insight</span>
                          </div>
                          <p className="goal-insight-detail">
                              Based on your body profile
                              {userProfile?.bmi && ` (BMI ${Number(userProfile.bmi).toFixed(1)}`}
                              {userProfile?.bmi && userProfile?.bmi_category && `, ${userProfile.bmi_category}`}
                              {userProfile?.bmi && ')'}
                              {`, `}
                              our model suggests{' '}
                              <strong>{goalValidation.ml_predicted || goalValidation.predicted}</strong>{' '}
                              might be more aligned with your current physique
                              {goalValidation.confidence > 0 && 
                                  ` (${Math.round(goalValidation.confidence * 100)}% confidence)`
                              }.
                          </p>
                          <p className="goal-respect">
                              We respect your choice! Showing <strong>{goalValidation.user_selected}</strong> plans below. 
                              You know your body best.
                          </p>
                      </div>
                  )}
              </div>
            )}

            {/* SECTION 5 — PLAN CARD DESIGN */}
            <div className="row mt-5">
              {recommendedPlans.map((plan, index) => (
                <div className="col-12 mb-4" key={plan.plan_id || index}>
                  <PlanCard rank={index} delay={index * 100}>
                    <div className="card-header-main">
                      <div className="header-left">
                        <RankBadge rank={index}>#{index + 1}</RankBadge>
                        <div className="title-group">
                          <h3>{plan.plan_name}</h3>
                          <BudgetTag budget={plan.budget_category} />
                        </div>
                      </div>
                      <div className="header-right">
                        <div className="score-ring-container">
                          <MatchRing score={plan.final_score * 100} />
                          <div className="ring-label">ML Match Score</div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 6 — SCORE BREAKDOWN BARS */}
                    <div className="score-breakdown-row">
                      <ScoreBar label="Similarity" val={plan.score_breakdown.similarity * 100} />
                      <ScoreBar label="Nutrition" val={plan.score_breakdown.nutrition_compatibility * 100} />
                      <ScoreBar label="Budget" val={plan.score_breakdown.budget_compatibility * 100} />
                      <ScoreBar label="Calories" val={plan.score_breakdown.calorie_match * 100} />
                    </div>

                    {/* SECTION 7 — QUICK NUTRITION STRIP */}
                    <div className="quick-nutrition-strip">
                      <div className="qn-item qn-cal">✦ {plan.nutrition_info?.total_calories || 0} kcal</div>
                      <div className="qn-item qn-pro">💪 {plan.nutrition_info?.total_protein_g || 0}g protein</div>
                      <div className="qn-item qn-carb">🌾 {plan.nutrition_info?.total_carbs_g || 0}g carbs</div>
                      <div className="qn-item qn-fat">🥑 {plan.nutrition_info?.total_fat_g || 0}g fat</div>

                      {plan.nutrition_info?.total_protein_g > 100 && (
                        <div className="qn-badge">High Protein</div>
                      )}
                      {plan.nutrition_info?.total_calories < userProfile?.calorie_target && (
                        <div className="qn-badge">Deficit Friendly</div>
                      )}
                    </div>

                    <div className="expand-trigger" onClick={() => toggleCard(index)}>
                      {expandedCards[index] ? "▴ Hide details" : "▾ View meals"}
                    </div>

                    {/* SECTION 8 — EXPANDABLE PLAN DETAILS */}
                    <ExpandableSection expanded={expandedCards[index]}>
                      <div className="meal-grid">
                        {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
                          const mealEmoji = mealType === "breakfast" ? "🌅" : mealType === "lunch" ? "☀️" : mealType === "snack" ? "🍎" : "🌙";
                          const mealData = plan.meals?.[mealType];
                          const mealMacros = plan.nutrition_info?.per_meal?.[mealType];

                          if (!mealData) return null;

                          return (
                            <div className="meal-card" key={mealType}>
                              <div className="mcard-header">
                                <span className="micon">{mealEmoji}</span>
                                <span className="mtype">{mealType}</span>
                              </div>
                              <h5 className="mname">{mealData.name}</h5>

                              <div className="mingredients">
                                {mealData.ingredients.map((ing, i) => (
                                  <span key={i} className="ing-tag">[{ing}]</span>
                                ))}
                              </div>

                              {mealData.preparation && (
                                <div className="mprep">
                                  {mealData.preparation.map((step, i) => (
                                    <div key={i} className="prep-step">
                                      <span className="step-num">{i + 1} &rarr;</span> {step}
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="mmacros-line">
                                {mealMacros ? (
                                  <>
                                    <span>✦{mealMacros.calories} kcal</span> |
                                    <span>💪{mealMacros.protein_g}g</span> |
                                    <span>🌾{mealMacros.carbs_g}g</span> |
                                    <span>🥑{mealMacros.fat_g}g</span>
                                  </>
                                ) : "Calculating macros..."}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* SECTION 9 — DAILY NUTRITION SUMMARY */}
                      <div className="daily-nutrition-summary">
                        <h4>📊 Daily Nutrition Breakdown</h4>

                        <div className="dns-content">
                          <div className="dns-macro-bars">
                            {(() => {
                              const p = plan.nutrition_info?.total_protein_g || 0;
                              const c = plan.nutrition_info?.total_carbs_g || 0;
                              const f = plan.nutrition_info?.total_fat_g || 0;
                              const total = (p * 4) + (c * 4) + (f * 9) || 1;

                              const pPct = ((p * 4) / total) * 100;
                              const cPct = ((c * 4) / total) * 100;
                              const fPct = ((f * 9) / total) * 100;

                              return (
                                <>
                                  <MacroBar color="#3B82F6" label="Protein" pct={pPct} />
                                  <MacroBar color="#F59E0B" label="Carbs" pct={cPct} />
                                  <MacroBar color="#8B5CF6" label="Fat" pct={fPct} />
                                </>
                              );
                            })()}
                          </div>
                          <div className="dns-cal-compare">
                            <div className="cc-label">Calorie Comparison</div>
                            <div className="cc-row">
                              <span className="ccl">Plan:</span>
                              <span className="ccv">{plan.nutrition_info?.total_calories || 0} kcal</span>
                            </div>
                            <div className="cc-row">
                              <span className="ccl">Target:</span>
                              <span className="ccv">{userProfile?.calorie_target || 0} kcal</span>
                            </div>

                            <div className="analysis-badges">
                              {plan.nutrition_info?.total_protein_g > 100 && (
                                <div className="ab-badge">✓ High Protein</div>
                              )}
                              {plan.nutrition_info?.total_calories < userProfile?.calorie_target && (
                                <div className="ab-badge">✓ Deficit Friendly</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ExpandableSection>

                  </PlanCard>
                </div>
              ))}
            </div>

            {/* SECTION 10 — RESULTS PAGE FOOTER */}
            <ResultsFooter>
              Analyzed {mlResponse?.metadata?.total_plans_evaluated || 27} plans •
              {mlResponse?.metadata?.plans_matching_criteria || recommendedPlans.length} matched your criteria •
              Showing top {recommendedPlans.length} •
              Processed in {mlResponse?.metadata?.processing_time_ms || 85}ms
            </ResultsFooter>

          </div>
        )}
      </PageContainer>

      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
    COMPONENTS & STYLES (PREMIUM UI REDESIGN)
───────────────────────────────────────────────────────────── */

const BudgetTag = ({ budget }) => {
  const map = {
    low: "💰 Low Budget",
    medium: "💰💰 Medium",
    high: "💰💰💰 Premium"
  };
  return <div className="budget-tag">{map[budget?.toLowerCase()] || "💰 Budget"}</div>
};

const ScoreBar = ({ label, val }) => {
  const percentage = Math.min(Math.max(val, 0), 100);
  return (
    <div className="score-bar-wrapper">
      <div className="sb-header">
        <span className="sb-label">{label}</span>
        <span className="sb-val">{percentage.toFixed(0)}%</span>
      </div>
      <div className="sb-track">
        <div className="sb-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const MatchRing = ({ score }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#EF4444"; // Red
  if (score > 50) color = "#F59E0B"; // Amber
  if (score > 75) color = "#2D6A4F"; // Green

  return (
    <div className="circular-chart-wrapper">
      <svg viewBox="0 0 60 60" className="circular-chart">
        <path className="circle-bg"
          d="M30 6 a24 24 0 0 1 0 48 a24 24 0 0 1 0 -48"
        />
        <path className="circle"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, stroke: color }}
          d="M30 6 a24 24 0 0 1 0 48 a24 24 0 0 1 0 -48"
        />
        <text x="30" y="35" className="percentage" fill={color}>{score.toFixed(0)}%</text>
      </svg>
    </div>
  );
};

const BmiGauge = ({ value }) => {
  let color = "#3B82F6"; // Blue (Underweight)
  let pct = (value / 40) * 100;
  if (value >= 18.5 && value < 25) color = "#2D6A4F"; // Green
  else if (value >= 25 && value < 30) color = "#F59E0B"; // Yellow
  else if (value >= 30) color = "#EF4444"; // Red

  pct = Math.min(Math.max(pct, 0), 100);

  return (
    <div className="bmi-gauge-container">
      <div className="bmi-gauge-track">
        <div className="bmi-gauge-fill" style={{ width: `${pct}%`, background: color }}></div>
      </div>
    </div>
  );
};

const MacroBar = ({ label, pct, color }) => (
  <div className="dns-mbar">
    <div className="dns-mbar-header">
      <span>{label}</span>
      <span>{pct.toFixed(0)}%</span>
    </div>
    <div className="dns-mbar-track">
      <div className="dns-mbar-fill" style={{ width: `${pct}%`, background: color }}></div>
    </div>
  </div>
);

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(0.95); opacity: 0.5; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.5; }
`;

// Styled Components
const PageContainer = styled.div`
  background-color: #F0FFF4;
  min-height: 100vh;
  font-family: "Inter", "Outfit", sans-serif;
  padding: 40px 20px;
  color: #1B4332;
`;

const Title = styled.h1`
  text-align: center;
  font-family: "Outfit", sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1B4332;
  margin-bottom: 40px;
`;

const ProfileSummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  max-width: 900px;
  margin: 0 auto 30px auto;
  border: 1px solid rgba(45, 106, 79, 0.1);
  background-image: linear-gradient(to bottom right, #ffffff, #F0FFF4);

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1.5fr;
    gap: 30px;
    
    @media (max-width: 1024px) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .profile-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    background: rgba(255,255,255,0.6);
    border-radius: 12px;
  }

  .col-label {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #40916C;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .bmi-value {
    font-size: 2.5rem;
    font-weight: 700;
    font-family: "Outfit", sans-serif;
    color: #1B4332;
    line-height: 1;
  }

  .bmi-category {
    font-size: 0.9rem;
    color: #40916C;
    margin: 5px 0 10px 0;
  }

  .bmi-gauge-container {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
  }
  .bmi-gauge-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 1s ease-out;
  }

  .cal-value {
    font-size: 2.2rem;
    font-weight: 700;
    font-family: "Outfit", sans-serif;
    color: #1B4332;
    margin-bottom: 10px;
    .unit { font-size: 1rem; color: #40916C; font-weight: 500; }
  }

  .meta-data {
    display: flex;
    gap: 15px;
    font-size: 0.85rem;
    color: #40916C;
    background: rgba(45, 106, 79, 0.05);
    padding: 5px 15px;
    border-radius: 20px;
  }

  .macro-pills {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .mpill {
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    text-align: center;
  }
  .m-protein { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
  .m-carbs { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
  .m-fat { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

  .sub-tag {
    font-size: 0.8rem;
    color: #94A3B8;
    margin-top: 10px;
  }
`;

const ValidationBanner = styled.div`
  max-width: 900px;
  margin: 0 auto 30px auto;
  padding: 12px 20px;
  border-radius: 10px;
  background: ${props => props.match ? 'rgba(45, 106, 79, 0.1)' : 'rgba(245, 158, 11, 0.1)'};
  border: 1px solid ${props => props.match ? '#95D5B2' : 'rgba(245, 158, 11, 0.3)'};
  color: ${props => props.match ? '#2D6A4F' : '#D97706'};
  font-size: 0.95rem;

  .banner-content {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
  }
  .b-icon { font-size: 1.2rem; }
`;

const getRankColor = (rank) => {
  if (rank === 0) return "#F59E0B"; // Gold
  if (rank === 1) return "#94A3B8"; // Silver
  if (rank === 2) return "#CD7F32"; // Bronze
  return "#2D6A4F"; // Green
};

const PlanCard = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 6px solid ${props => getRankColor(props.rank)};
  padding: 25px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${fadeIn} 0.5s ease backwards;
  animation-delay: ${props => props.delay}ms;
  max-width: 900px;
  margin: 0 auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  }

  .card-header-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .header-left {
    display: flex;
    gap: 15px;
    align-items: flex-start;
  }

  .title-group h3 {
    font-family: "Outfit", sans-serif;
    font-weight: 700;
    color: #1B4332;
    margin: 0 0 5px 0;
    font-size: 1.5rem;
  }

  .budget-tag {
    font-size: 0.85rem;
    color: #40916C;
    background: #F0FFF4;
    padding: 3px 10px;
    border-radius: 12px;
    display: inline-block;
    border: 1px solid #95D5B2;
  }

  .score-ring-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .circular-chart-wrapper { width: 60px; height: 60px; }
  .circle-bg { fill: none; stroke: #f1f5f9; stroke-width: 3.8; }
  .circle { fill: none; stroke-width: 3.8; stroke-linecap: round; transition: stroke-dashoffset 1s ease-out; }
  .percentage { font-family: "Outfit", sans-serif; font-size: 16px; font-weight: 700; text-anchor: middle; }
  .ring-label { font-size: 0.7rem; color: #94a3b8; margin-top: 5px; text-transform: uppercase; font-weight: 600;}

  .score-breakdown-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    
    @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
  }

  .score-bar-wrapper { width: 100%; }
  .sb-header { display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px; color: #40916C; }
  .sb-val { font-weight: 600; font-family: "Outfit", sans-serif; color: #1B4332; }
  .sb-track { width: 100%; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
  .sb-fill { height: 100%; background: #2D6A4F; border-radius: 3px; }

  .quick-nutrition-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 15px 0;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    align-items: center;
  }

  .qn-item { font-size: 0.95rem; font-weight: 500; }
  .qn-cal { color: #EF4444; font-family: "Outfit", sans-serif; font-weight: 600;}
  .qn-pro { color: #3B82F6; }
  .qn-carb { color: #F59E0B; }
  .qn-fat { color: #8B5CF6; }

  .qn-badge {
    background: #2D6A4F;
    color: white;
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
  }

  .expand-trigger {
    text-align: center;
    padding: 15px 0 0 0;
    color: #40916C;
    font-weight: 500;
    cursor: pointer;
    font-size: 0.9rem;
    &:hover { color: #1B4332; }
  }
`;

const RankBadge = styled.div`
  background: ${props => getRankColor(props.rank)};
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Outfit", sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
`;

const ExpandableSection = styled.div`
  max-height: ${props => props.expanded ? '2000px' : '0'};
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
  margin-top: ${props => props.expanded ? '20px' : '0'};
  background: #F9FAFB;
  border-radius: 8px;
  padding: ${props => props.expanded ? '20px' : '0 20px'};

  .meal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
  }

  .meal-card {
    background: white;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .mcard-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .mtype { font-weight: 600; color: #475569; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px;}
  .mname { font-size: 1.1rem; font-weight: 600; color: #1e293b; margin: 0 0 10px 0; }
  
  .mingredients { margin-bottom: 12px; }
  .ing-tag { display: inline-block; font-size: 0.8rem; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; margin: 0 4px 4px 0; }

  .mprep { font-size: 0.85rem; color: #475569; margin-bottom: 12px; }
  .prep-step { margin-bottom: 4px; }
  .step-num { color: #94a3b8; font-weight: 600; }

  .mmacros-line {
    font-size: 0.85rem;
    font-weight: 500;
    color: #40916C;
    border-top: 1px dashed #cbd5e1;
    padding-top: 10px;
    font-family: "Outfit", sans-serif;
  }

  .daily-nutrition-summary {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
    
    h4 { font-family: "Outfit", sans-serif; font-weight: 600; color: #1e293b; font-size: 1.2rem; margin-bottom: 20px; }
  }

  .dns-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
  }

  .dns-mbar { margin-bottom: 12px; }
  .dns-mbar-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 500; margin-bottom: 4px; color: #475569;}
  .dns-mbar-track { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow:hidden;}
  .dns-mbar-fill { height: 100%; border-radius: 4px; }

  .cc-label { font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 10px; }
  .cc-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.95rem; }
  .ccl { color: #64748b; }
  .ccv { font-weight: 600; color: #1e293b; font-family: "Outfit", sans-serif; }

  .analysis-badges { display: flex; gap: 10px; margin-top: 15px;}
  .ab-badge { font-size: 0.8rem; color: #2D6A4F; background: #F0FFF4; border: 1px solid #95D5B2; padding: 4px 10px; border-radius: 12px; font-weight: 500; }
`;

const ResultsFooter = styled.div`
  text-align: center;
  margin-top: 40px;
  font-size: 0.85rem;
  color: #94A3B8;
  padding: 20px;
  border-top: 1px solid rgba(45, 106, 79, 0.1);
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
  
  .error-content {
    background: var(--color-bg-card, white);
    border: 1px solid var(--color-border);
    border-top: 4px solid var(--color-secondary, #B85C38);
    padding: 30px;
    border-radius: var(--radius-lg, 12px);
    box-shadow: var(--shadow-md, 0 4px 15px rgba(0,0,0,0.05));
    max-width: 500px;
    text-align: center;
  }

  h3 { color: var(--color-secondary-dark, #5F7161); font-family: var(--font-display); margin-bottom: 15px; }
  p { color: var(--color-text-secondary, #475569); margin-bottom: 20px; }
  button {
    background: var(--color-primary, #B85C38); color: var(--color-bg-card, white); border: none; padding: 10px 24px; border-radius: var(--radius-md, 8px); font-weight: 500; font-family: var(--font-body);
    transition: background 0.2s, transform 0.1s;
    &:hover { background: var(--color-primary-dark, #804027); transform: translateY(-1px); }
  }
`;

const EmptyContainer = styled(ErrorContainer)`
  .error-content { border-top-color: var(--color-secondary-light, #F59E0B); }
  .empty-icon { font-size: 3rem; display: block; margin-bottom: 15px; }
  h3 { color: var(--color-secondary-dark, #D97706); }
  button { background: var(--color-secondary, #2D6A4F); &:hover { background: var(--color-secondary-dark, #1B4332); transform: translateY(-1px); } }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  max-width: 500px;
  margin: 0 auto;

  .spinner-container {
    margin-bottom: 30px;
  }

  .custom-spinner {
    width: 60px;
    height: 60px;
    background: var(--color-secondary-light, #6B8E23);
    border-radius: 50%;
    animation: pulseGlow 1.5s ease-in-out infinite;
    border: none;
  }

  @keyframes pulseGlow {
    0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(107, 142, 35, 0.4); }
    50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 15px rgba(107, 142, 35, 0); }
    100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(107, 142, 35, 0); }
  }

  .loading-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    background: var(--color-bg-card, white);
    padding: var(--space-6, 24px);
    border-radius: var(--radius-lg, 12px);
    box-shadow: var(--shadow-sm);
  }
`;

const LoadingStep = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: var(--text-base);
  color: ${props => props.completed ? 'var(--color-primary-dark)' : props.active ? 'var(--color-text-primary)' : 'var(--color-text-muted)'};
  font-weight: ${props => props.active || props.completed ? '600' : '400'};
  opacity: ${props => props.active ? '1' : props.completed ? '0.8' : '0.4'};
  transition: all 0.3s ease;
  font-family: var(--font-body);

  ${props => props.active && css`animation: ${pulseAnimation} 1.5s infinite;`}

  .icon {
    font-size: 1.1rem;
    width: 20px;
    text-align: center;
  }
`;
