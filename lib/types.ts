export type Locale = 'en' | 'ar';
export type DocumentStatus = 'draft' | 'in-review' | 'approved' | 'changes-requested';
export type RewriteMode = 'concise' | 'formal' | 'simple';
export type AgentId = 'writer' | 'researcher' | 'monitor';
export interface DocumentContent { title: string; paragraphs: string[] }
export interface Version extends DocumentContent { id: string; number: number; createdAt: string; note: string }
export interface ReviewComment { id: string; text: string; createdAt: string; paragraph: number | null }
export interface Activity { id: string; type: string; text: string; createdAt: string }
export interface Campaign { id: string; name: string; brief: string; market: string; language: Locale; status: DocumentStatus; content: DocumentContent; versions: Version[]; comments: ReviewComment[]; activity: Activity[]; createdAt: string; updatedAt: string; approvedAt: string | null }
export interface Agent { id: AgentId; active: boolean; runs: number; lastRunAt: string | null }
export interface Coverage { id: string; outlet: string; headline: string; sentiment: 'positive' | 'neutral' | 'negative'; date: string; campaignId: string; excerpt: string }
export interface DemoState { schemaVersion: 1; locale: Locale; campaigns: Campaign[]; agents: Agent[]; coverage: Coverage[] }
export interface CampaignInput { name: string; brief: string; market: string; language: Locale }
export interface Proposal { paragraph: number; original: string; replacement: string; mode: RewriteMode }
export type DemoAction =
 | { type: 'restore'; state: DemoState }
 | { type: 'reset' }
 | { type: 'locale'; locale: Locale }
 | { type: 'create'; input: CampaignInput; id: string; at: string }
 | { type: 'save'; id: string; content: DocumentContent; at: string }
 | { type: 'review'; id: string; at: string }
 | { type: 'approve'; id: string; at: string }
 | { type: 'changes'; id: string; feedback: string; at: string }
 | { type: 'comment'; id: string; text: string; paragraph: number | null; at: string }
 | { type: 'invalidate'; id: string; at: string }
 | { type: 'toggle-agent'; id: AgentId }
 | { type: 'run-agent'; id: AgentId; at: string };
