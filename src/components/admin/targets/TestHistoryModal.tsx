'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getTestHistory } from '@/app/admin/(dashboard)/targets/actions';

export default function TestHistoryModal({ scrapeUrl, onClose }: { scrapeUrl: string, onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await getTestHistory(scrapeUrl);
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setHistory(res.data);
          if (res.data.length > 0) {
            setSelectedId(res.data[0].id);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [scrapeUrl]);

  const selectedJob = useMemo(() => {
    if (!selectedId) return null;
    return history.find(j => j.id === selectedId) || null;
  }, [history, selectedId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              历史测试结果
            </h2>
            <div className="text-xs text-gray-500 mt-1 font-mono truncate max-w-xl">{scrapeUrl}</div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex bg-gray-50 dark:bg-zinc-950">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>正在加载测试记录...</p>
            </div>
          ) : error ? (
            <div className="flex-1 p-6">
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-900/50">
                {error}
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex-1 text-center py-20 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>暂无该渠道的测试历史记录</p>
            </div>
          ) : (
            <>
              {/* 左侧：测试列表 */}
              <div className="w-1/3 min-w-[250px] border-r border-gray-200 dark:border-zinc-800 overflow-y-auto bg-white dark:bg-zinc-900">
                <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                  {history.map((job) => (
                    <div 
                      key={job.id} 
                      onClick={() => setSelectedId(job.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedId === job.id 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {job.status === 'completed' ? (
                          <CheckCircle className={`w-5 h-5 ${selectedId === job.id ? 'text-blue-500' : 'text-green-500'}`} />
                        ) : job.status === 'failed' ? (
                          <XCircle className={`w-5 h-5 ${selectedId === job.id ? 'text-blue-500' : 'text-red-500'}`} />
                        ) : (
                          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                        
                        <div>
                          <div className={`font-medium text-sm flex items-center gap-2 ${
                            selectedId === job.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {job.status === 'completed' ? '测试成功' : job.status === 'failed' ? '测试失败' : '进行中...'}
                          </div>
                          <div className={`text-xs mt-1 ${
                            selectedId === job.id ? 'text-blue-600/70 dark:text-blue-400/70' : 'text-gray-500'
                          }`} suppressHydrationWarning>
                            {new Date(job.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右侧：测试详情 */}
              <div className="w-2/3 flex-1 min-w-0 overflow-y-auto p-4 md:p-6">
                {selectedJob ? (
                  <div>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          {selectedJob.status === 'completed' ? (
                            <><CheckCircle className="w-5 h-5 text-green-500" /> 测试成功</>
                          ) : selectedJob.status === 'failed' ? (
                            <><XCircle className="w-5 h-5 text-red-500" /> 测试失败</>
                          ) : (
                            <><Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> 进行中...</>
                          )}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1" suppressHydrationWarning>
                          测试时间：{new Date(selectedJob.created_at).toLocaleString()}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-zinc-300">
                        引擎: {selectedJob.scraper_type}
                      </span>
                    </div>

                    {selectedJob.error_message && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-red-600 mb-2">错误详情</h4>
                        <div className="bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 p-4 rounded-xl text-sm font-mono whitespace-pre-wrap border border-red-100 dark:border-red-900/30">
                          {selectedJob.error_message}
                        </div>
                      </div>
                    )}
                    
                    {selectedJob.result_data && Array.isArray(selectedJob.result_data) && selectedJob.result_data.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">抓取商品列表</h4>
                          <span className="text-xs text-gray-500 bg-white dark:bg-zinc-800 px-2 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
                            共 {selectedJob.result_data.length} 条记录
                          </span>
                        </div>
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead className="bg-gray-50 dark:bg-zinc-900 sticky top-0 shadow-sm z-10">
                                <tr>
                                  <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 whitespace-nowrap">映射商品 ID</th>
                                  <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400">抓取原始标题</th>
                                  <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 text-right">价格</th>
                                  <th className="p-3 font-semibold text-gray-500 dark:text-zinc-400 text-center">状态</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                {selectedJob.result_data.map((item: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                                    <td className="p-3">
                                      {item.canonical_product_id === 'unknown' ? (
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
                                          未匹配
                                        </span>
                                      ) : (
                                        <div className="flex flex-col gap-0.5">
                                          {item.canonical_product_name && (
                                            <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                                              {item.canonical_product_name}
                                            </span>
                                          )}
                                          <span className="font-mono text-[10px] text-gray-500" title="映射商品 ID">
                                            {item.canonical_product_id}
                                          </span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3 text-gray-900 dark:text-zinc-200">
                                      <a href={item.url} target="_blank" rel="noreferrer" className="hover:underline hover:text-primary line-clamp-2" title={item.product_title}>
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
                      </div>
                    ) : selectedJob.result_data ? (
                      <div className="p-8 text-center text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                        {Array.isArray(selectedJob.result_data) ? '该次测试成功，但未抓取到任何商品。' : '返回数据非标准列表格式。'}
                      </div>
                    ) : null}

                    {!selectedJob.error_message && !selectedJob.result_data && (
                      <div className="p-8 text-center text-gray-400 italic bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
                        该记录无测试结果数据
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    请在左侧选择一条历史记录查看详情
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
