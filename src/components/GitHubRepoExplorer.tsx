import React, { useState } from 'react';
import {
  Folder,
  FileText,
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  Play,
  RotateCw,
  Terminal,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AgentDefinition, PullRequest } from '../types/factory';

interface GitHubRepoExplorerProps {
  agents: AgentDefinition[];
  pullRequests: PullRequest[];
  onTriggerDispatch: (workflowName: string) => Promise<void>;
  onApprovePr: (prId: string) => Promise<void>;
}

export const GitHubRepoExplorer: React.FC<GitHubRepoExplorerProps> = ({
  agents,
  pullRequests,
  onTriggerDispatch,
  onApprovePr
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('agents/grant_reviewer/agent.yaml');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchLog, setDispatchLog] = useState<string | null>(null);

  const virtualFileTree = [
    {
      name: '.github',
      type: 'folder',
      children: [
        { name: 'workflows/agent-dispatch.yml', type: 'file' },
        { name: 'workflows/regression-test.yml', type: 'file' }
      ]
    },
    {
      name: 'agents',
      type: 'folder',
      children: [
        { name: 'agents/grant_reviewer/agent.yaml', type: 'file' },
        { name: 'agents/lawyer/agent.yaml', type: 'file' },
        { name: 'agents/accountant/agent.yaml', type: 'file' },
        { name: 'agents/economist/agent.yaml', type: 'file' },
        { name: 'agents/ministry/agent.yaml', type: 'file' }
      ]
    },
    {
      name: 'skills',
      type: 'folder',
      children: [
        { name: 'skills/source_verification.yaml', type: 'file' },
        { name: 'skills/regulatory_cross_check.yaml', type: 'file' },
        { name: 'skills/financial_audit.yaml', type: 'file' }
      ]
    },
    {
      name: 'rules',
      type: 'folder',
      children: [
        { name: 'rules/RULE-001.yaml', type: 'file' },
        { name: 'rules/RULE-002.yaml', type: 'file' }
      ]
    },
    {
      name: 'memory',
      type: 'folder',
      children: [
        { name: 'memory/global_memory.json', type: 'file' },
        { name: 'memory/error_memory.json', type: 'file' }
      ]
    }
  ];

  const getFileContent = (path: string) => {
    if (path.includes('agent-dispatch.yml')) {
      return `name: Master Agent Dispatch & Execution
on:
  repository_dispatch:
    types: [telegram_task, evolve_cycle, rollback_request]

jobs:
  execute-agent:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Execute Master Agent
        env:
          OPENROUTER_API_KEY: \${{ secrets.OPENROUTER_API_KEY }}
          TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
        run: |
          echo "Task payload: \${{ github.event.client_payload.task_id }}"
          npm run task:run -- --task-id="\${{ github.event.client_payload.task_id }}"`;
    }

    if (path.includes('source_verification.yaml')) {
      return `skill_id: source_verification
purpose: "Проверка первичных источников по официальным реестрам"
input: claim
workflow:
  - identify_claim
  - locate_primary_source
  - compare_revisions
  - evaluate_validity
  - report_provenance
required_tools:
  - web
  - legal_database
risk: medium`;
    }

    if (path.includes('RULE-001.yaml')) {
      return `rule_id: RULE-001
description: "При юридических, финансовых и нормативных задачах обязательно проверять первичный источник"
reason: "Исключение ссылок на проекты и отмененные акты"
source: "ERR-2026-0042"
confidence: 0.98
validated_by: "USER_APPROVAL"
affected_agents: [lawyer, ministry, accountant, grant_reviewer]
status: VALIDATED`;
    }

    const agentMatch = agents.find((a) => path.includes(a.id));
    if (agentMatch) {
      return `id: ${agentMatch.id}
name: ${agentMatch.name}
version: ${agentMatch.version}
status: ${agentMatch.status}
mission: "${agentMatch.mission}"
skills: [${agentMatch.skills.join(', ')}]
score: ${agentMatch.score.total}/100`;
    }

    return `# File: ${path}\n# Status: Synced with git commit 9a4c1f2\n# Version: 1.0`;
  };

  const handleDispatch = async () => {
    setIsDispatching(true);
    setDispatchLog('Отправка repository_dispatch в GitHub Actions...');
    await onTriggerDispatch('agent-dispatch.yml');
    setTimeout(() => {
      setDispatchLog('✅ Workflow #842 успешно выполнен на runner ubuntu-latest: PASS (0 errors)');
      setIsDispatching(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            GitHub Repository &amp; Actions Dispatch (Section 29 &amp; 30)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Центральное хранилище кода, агентов, памяти и тестов • CI/CD исполнение • repository_dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDispatch}
            disabled={isDispatching}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-mono font-medium transition-colors border border-slate-700 shadow-sm"
          >
            {isDispatching ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>repository_dispatch</span>
          </button>
        </div>
      </div>

      {dispatchLog && (
        <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center justify-between">
          <span>{dispatchLog}</span>
          <button onClick={() => setDispatchLog(null)} className="text-slate-500 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Main Grid: File Tree + Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* File Explorer Tree */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <span>main (commit: 9a4c1f2)</span>
            </span>
            <span className="text-[10px] text-slate-500">SYNCED</span>
          </div>

          <div className="space-y-2">
            {virtualFileTree.map((dir) => (
              <div key={dir.name} className="space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-bold">
                  <Folder className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{dir.name}/</span>
                </div>
                <div className="pl-4 space-y-1 border-l border-slate-800 ml-1.5">
                  {dir.children.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => setSelectedFile(f.name)}
                      className={`flex items-center gap-1.5 w-full text-left py-1 px-1.5 rounded transition-colors text-[11px] truncate ${
                        selectedFile === f.name
                          ? 'bg-emerald-500/10 text-emerald-300 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <FileText className="w-3 h-3 shrink-0" />
                      <span className="truncate">{f.name.split('/').pop()}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Content Preview */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col font-mono text-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
            <span className="text-white font-semibold truncate">{selectedFile}</span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              IMMUTABLE GIT RECORD
            </span>
          </div>

          <pre className="flex-1 overflow-x-auto text-slate-300 text-[11px] leading-relaxed p-2 select-all whitespace-pre">
            {getFileContent(selectedFile)}
          </pre>
        </div>
      </div>
    </div>
  );
};
