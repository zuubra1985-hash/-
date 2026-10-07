export type AgentStatus = 'HEALTHY' | 'WARNING' | 'DEGRADED' | 'FAILING' | 'RETIRED';

export type AgentRoleType =
  | 'COORDINATOR'
  | 'RESEARCHER'
  | 'ANALYST'
  | 'WRITER'
  | 'DEVELOPER'
  | 'REVIEWER'
  | 'TESTER'
  | 'FACT_CHECKER'
  | 'SPECIALIST';

export interface AgentVersionRecord {
  version: string;
  date: string;
  author: string;
  reason: string;
  modified_components: string[];
  old_score: number;
  new_score: number;
  test_pass_rate: number;
  regression_status: 'PASS' | 'FAIL' | 'BYPASSED';
  pr_id?: string;
  commit_hash: string;
  is_active: boolean;
}

export interface AgentLearningRecord {
  id: string;
  date: string;
  summary: string;
  source_task: string;
  impact: string;
  validated: boolean;
}

export interface AgentDefinition {
  id: string;
  name: string;
  version: string;
  status: AgentStatus;
  role: AgentRoleType;
  mission: string;
  domain: string;
  responsibilities: string[];
  capabilities: string[];
  knowledge: string[];
  skills: string[];
  tools: string[];
  workflow: string[];
  decision_rules: string[];
  verification: string[];
  memory: string[];
  restrictions: string[];
  escalation_rules: string[];
  test_suite: string[];
  score: {
    total: number;
    accuracy: number;
    completeness: number;
    reasoning: number;
    factuality: number;
    source_quality: number;
    instruction_following: number;
    safety: number;
    efficiency: number;
  };
  known_weaknesses: string[];
  version_history: AgentVersionRecord[];
  learning_history: AgentLearningRecord[];
  metrics: {
    success_rate: number;
    error_rate: number;
    regression_rate: number;
    average_cost_usd: number;
    average_latency_ms: number;
    task_count: number;
  };
}

export interface SkillDefinition {
  skill_id: string;
  title: string;
  purpose: string;
  input: string;
  workflow: string[];
  required_tools: string[];
  risk: 'low' | 'medium' | 'high';
  version: string;
  used_by_agents: string[];
  tests_count: number;
  last_validated: string;
}

export type RuleStatus = 'DRAFT' | 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'DEPRECATED';

export interface GlobalRule {
  rule_id: string;
  title: string;
  description: string;
  reason: string;
  source: string;
  created_from: string;
  confidence: number;
  validated_by: string;
  affected_agents: string[];
  tests: string[];
  status: RuleStatus;
  created_at: string;
}

export type MemoryLayer =
  | 'USER_MEMORY'
  | 'AGENT_MEMORY'
  | 'GLOBAL_MEMORY'
  | 'ERROR_MEMORY'
  | 'PATTERN_MEMORY'
  | 'RULE_MEMORY'
  | 'TEST_MEMORY';

export type MemoryItemStatus = 'DRAFT' | 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'DEPRECATED';

export interface MemoryItem {
  id: string;
  layer: MemoryLayer;
  title: string;
  content: string;
  agent_id?: string;
  provenance: {
    knowledge_id: string;
    source: string;
    source_type: 'PRIMARY_SOURCE' | 'VERIFIED_KNOWLEDGE' | 'EXPERIENCE' | 'USER_DIRECTIVE' | 'AUTO_SYNTHESIS';
    date: string;
    created_by: string;
    confidence: number;
    verified: boolean;
    verification_method: string;
    used_by: string[];
  };
  status: MemoryItemStatus;
  updated_at: string;
}

export interface ErrorRecord {
  error_id: string;
  agent_id: string;
  task_id: string;
  timestamp: string;
  description: string;
  expected: string;
  actual: string;
  symptom: string;
  intermediate_cause: string;
  root_cause: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  proposed_fix: string;
  affected_skill?: string;
  affected_rule?: string;
  tests_required: string[];
  status: 'open' | 'analyzing' | 'mitigated' | 'fixed';
}

export type TestType =
  | 'BASIC'
  | 'COMPLEX'
  | 'EDGE'
  | 'INCOMPLETE'
  | 'CONFLICT'
  | 'ADVERSARIAL'
  | 'SOURCE'
  | 'REGRESSION';

export interface TestCase {
  id: string;
  agent_id: string;
  name: string;
  type: TestType;
  prompt: string;
  input_data?: string;
  expected_output_criteria: string[];
  critical: boolean;
  last_run_status: 'PASS' | 'FAIL' | 'UNTESTED';
  last_run_date?: string;
  execution_time_ms?: number;
  score?: number;
}

export interface EvaluationOutput {
  accuracy: number;
  completeness: number;
  reasoning: number;
  factuality: number;
  source_quality: number;
  instruction_following: number;
  safety: number;
  efficiency: number;
  total_score: number;
  critical_failures: string[];
  recommendations: string[];
  self_critique?: {
    what_was_done: string;
    what_succeeded: string;
    where_error_occurred: string;
    why_it_happened: string;
    how_to_remediate: string;
    how_to_verify: string;
  };
}

export interface ChangeProposal {
  change_id: string;
  agent_id: string;
  title: string;
  description: string;
  reason: string;
  expected_effect: string;
  risk: 'low' | 'medium' | 'high';
  affected_components: string[];
  tests_required: string[];
  old_score: number;
  candidate_score: number;
  regression_result: 'PASS' | 'FAIL';
  created_at: string;
}

export interface PullRequest {
  id: string;
  pr_number: number;
  agent_id: string;
  title: string;
  current_version: string;
  candidate_version: string;
  current_score: number;
  candidate_score: number;
  regression_status: 'PASS' | 'FAIL';
  critical_failures_count: number;
  description: string;
  status: 'OPEN_AWAITING_APPROVAL' | 'MERGED' | 'REJECTED' | 'ROLLED_BACK';
  diff_summary: {
    added_skills: string[];
    modified_rules: string[];
    workflow_changes: string[];
    verification_steps_added: string[];
  };
  created_at: string;
}

export interface SubAgentTask {
  id: string;
  agent_id: string;
  agent_name: string;
  role: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'conflict_detected';
  output?: string;
  identified_issues?: string[];
  sources_checked?: string[];
  confidence?: number;
  duration_ms?: number;
}

export interface TaskRecord {
  task_id: string;
  user_input: string;
  task_type: 'ASK' | 'TASK' | 'CREATE_AGENT' | 'IMPROVE' | 'TEST' | 'AUDIT' | 'LEARN' | 'EVOLVE' | 'ROLLBACK';
  status: 'QUEUED' | 'ANALYZING' | 'ORCHESTRATING' | 'EXECUTING' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  completed_at?: string;
  assigned_agents: string[];
  pipeline_steps: {
    step_name: string;
    agent_id: string;
    status: 'pending' | 'running' | 'done' | 'failed';
  }[];
  sub_tasks: SubAgentTask[];
  contradictions_found: {
    statement_a: string;
    source_a: string;
    statement_b: string;
    source_b: string;
    resolution: string;
  }[];
  final_result?: string;
  evaluation?: EvaluationOutput;
  associated_error_id?: string;
  associated_pr_id?: string;
  tokens_used: number;
  cost_usd: number;
  model_used: string;
}

export interface TelegramMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  task_id?: string;
  progress_card?: {
    task_name: string;
    status: string;
    steps: {
      name: string;
      status: 'pending' | 'in_progress' | 'done' | 'error';
    }[];
  };
  completion_card?: {
    agent_name: string;
    version: string;
    score: number;
    findings_count: number;
    recommendations_count: number;
    regression_status: 'PASS' | 'FAIL';
  };
  buttons?: {
    label: string;
    action: string;
    payload?: any;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  attached_file?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface ModelRouterConfig {
  provider: 'openrouter' | 'gemini_native';
  default_model: string;
  research_model: string;
  coding_model: string;
  reasoning_model: string;
  fallback_models: string[];
  max_cost_per_task: number;
  max_cost_per_day: number;
  max_tokens_per_task: number;
  temperature: number;
  daily_cost_current: number;
}
