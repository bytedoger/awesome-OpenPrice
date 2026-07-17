'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Play, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createTestJob, getTestJob } from '@/app/admin/(dashboard)/test-scrape-actions';
import { verifyTarget } from '@/app/admin/(dashboard)/targets/actions';
import { approveSubmission, updateSubmissionScraperType } from '@/app/admin/(dashboard)/submissions/actions';

interface TestScrapeModalProps {
  targetId?: string;
  submissionId?: string;
  url: string;
  scraperType: string;
  title: string;
  onClose: () => void;
}

export default function TestScrapeModal({ targetId, submissionId, url, scraperType, title, onClose }: TestScrapeModalProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'processing' | 'completed' | 'failed'>('idle');
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [selectedScraperType, setSelectedScraperType] = useState(scraperType);
  const [actualScraperType, setActualScraperType] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>(title);
  const [extractedName, setExtractedName] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkJob() {
      if (!jobId) return;
      const { data, error } = await getTestJob(jobId);
      
      if (error) {
        setStatus('failed');
        setErrorMsg(error);
        return;
      }

      if (data) {
        setStatus(data.status as any);
        if (data.status === 'completed') {
          const resultData = data.result_data;
          if (Array.isArray(resultData)) {
            setResult(resultData);
          } else if (resultData && resultData.offers) {
            setResult(resultData.offers);
            // 只有当用户没有自定义名字（原名为“未命名”）时，才用抓取到的名字覆盖弹窗里的名字
            if (resultData.extracted_name) {
              setExtractedName(resultData.extracted_name);
              if (title.includes('未命名')) {
                setStoreName(resultData.extracted_name);
              }
            }
          }
          setActualScraperType(data.scraper_type);
          if (submissionId && data.scraper_type) {
            updateSubmissionScraperType(submissionId, data.scraper_type);
          }
        } else if (data.status === 'failed') {
          setErrorMsg(data.error_message);
        }
      }
    }

    if (status === 'pending' || status === 'processing') {
      interval = setInterval(checkJob, 1500);
    }

    return () => clearInterval(interval);
  }, [jobId, status]);

  async function handleStartTest() {
    setStatus('pending');
    setErrorMsg(null);
    setResult(null);
    setActualScraperType(null);

    const { data, error } = await createTestJob(url, selectedScraperType);
    if (error) {
      setStatus('failed');
      setErrorMsg(error);
    } else {
      setJobId(data);
    }
  }

  async function handleVerify() {
    if (!targetId) return;
    setIsVerifying(true);
    await verifyTarget(targetId);
    setIsVerifying(false);
    onClose();
  }

  async function handleApproveSubmission() {
    if (!submissionId) return;
    setIsApproving(true);
    
    const formData = new FormData();
    formData.append('is_auto_approve', 'true');
    formData.append('name', storeName);
    formData.append('site_url', url);
    formData.append('scrape_url', url);
    formData.append('scraper_type', actualScraperType || selectedScraperType || 'other');
    formData.append('remarks', '极客测试自动一键转正');
    
    const res = await approveSubmission(submissionId, formData);
    setIsApproving(false);
    
    if (res?.error) {
      alert(res.error);
    }
    
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">测试拉取: {title}</h3>
          <button 
            onClick={() => {
              if (status === 'completed') {
                router.refresh();
              }
              onClose();
            }}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">目标 URL</label>
                <div className="text-sm font-mono bg-gray-50 dark:bg-zinc-900 p-2 rounded border border-gray-200 dark:border-zinc-800 break-all text-gray-700 dark:text-zinc-300">
                  {url}
                </div>
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">解析引擎</label>
                <select 
                  value={selectedScraperType}
                  onChange={(e) => setSelectedScraperType(e.target.value)}
                  disabled={status === 'pending' || status === 'processing'}
                  className="w-full text-sm font-mono bg-white dark:bg-zinc-950 p-2 rounded border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="auto">自动探测 (Auto)</option>
                  <option value="ldxp">链动小铺</option>
                  <option value="dujiao">独角数卡</option>
                  <option value="lizhi">二次元发卡</option>
                  <option value="other">其它</option>
                </select>
              </div>
            </div>

            {status === 'idle' && (
              <button 
                onClick={handleStartTest}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Play className="w-5 h-5" />
                立即发射测试任务
              </button>
            )}

            {(status === 'pending' || status === 'processing') && (
              <div className="flex flex-col items-center justify-center p-8 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <div className="text-blue-600 dark:text-blue-400 font-medium">
                  {status === 'pending' ? '任务已进入队列，等待 Worker 响应...' : 'Worker 正在执行拉取和解析逻辑...'}
                </div>
              </div>
            )}

            {status === 'failed' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-2">
                  <XCircle className="w-5 h-5" />
                  测试失败
                </div>
                <div className="text-sm text-red-500 font-mono bg-red-100/50 dark:bg-red-950 p-2 rounded">
                  {errorMsg}
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    拉取成功！共提取到 {result?.length || 0} 条标准化商品数据
                  </div>
                  {selectedScraperType === 'auto' && actualScraperType && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      自动探测成功，已成功匹配引擎：<span className="font-semibold text-primary">{actualScraperType === 'ldxp' ? '链动小铺' : actualScraperType === 'dujiao' ? '独角数卡' : actualScraperType === 'lizhi' ? '二次元发卡' : actualScraperType}</span>
                    </div>
                  )}
                  
                  {submissionId && (
                    <div className="flex flex-col gap-2 mt-3 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg border border-gray-200 dark:border-zinc-800">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        请选择转正时使用的店铺名称：
                      </label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            checked={storeName === title} 
                            onChange={() => setStoreName(title)}
                            className="text-primary h-4 w-4"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            用户提报：<span className="font-medium">{title}</span>
                          </span>
                        </label>

                        {extractedName && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              checked={storeName === extractedName} 
                              onChange={() => setStoreName(extractedName)}
                              className="text-primary h-4 w-4"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              自动提取：<span className="font-medium text-emerald-600 dark:text-emerald-400">{extractedName}</span>
                            </span>
                          </label>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            checked={storeName !== title && storeName !== extractedName}
                            readOnly
                            className="text-primary h-4 w-4"
                          />
                          <input 
                            type="text" 
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-950 text-sm outline-none focus:ring-1 focus:ring-primary w-full max-w-xs"
                            placeholder="自定义修改..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {result && result.length > 0 ? (
                  <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-900 sticky top-0 shadow-sm">
                          <tr>
                            <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 whitespace-nowrap">映射商品名称</th>
                            <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400">抓取原始标题</th>
                            <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 text-right">价格</th>
                            <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 text-center">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                          {result.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                              <td className="p-3">
                                {item.canonical_product_id === 'unknown' ? (
                                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                                    未匹配 (unknown)
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs text-primary">{item.canonical_product_name || item.canonical_product_id}</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-900 dark:text-zinc-200 min-w-[200px]">
                                <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary">
                                  {item.product_title}
                                </a>
                              </td>
                              <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                                ¥{Number(item.price).toFixed(2)}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                {item.status === 'in_stock' ? (
                                  <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">有货</span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">缺货</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                    该渠道返回了空列表，请检查 URL 或源站结构是否已更改。
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {status !== 'idle' && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center">
            <div>
              {status === 'completed' && targetId && (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isVerifying ? '正在验证...' : '设为已验证并允许日常拉取'}
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartTest}
                disabled={status === 'pending' || status === 'processing'}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                重新测试
              </button>
              
              {status === 'completed' && submissionId && (
                <button
                  onClick={handleApproveSubmission}
                  disabled={isApproving}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isApproving ? '转正中...' : '一键转正'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
