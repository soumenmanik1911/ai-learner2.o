"use client";
import React, { useState, useEffect } from 'react';
import { BarChart3, Brain, Clock, Target, TrendingUp, Calendar, Award, Zap } from 'lucide-react';
import { getUserCompanions } from '@/lib/actions/companion.action';
import { useUser } from '@clerk/nextjs';

interface StudySession {
  id: string;
  date: string;
  subject: string;
  duration: number;
  score: number;
  companion: string;
  topics: string[];
}

interface LearningInsight {
  type: 'strength' | 'improvement' | 'trend' | 'recommendation';
  title: string;
  description: string;
  icon: string;
  actionable?: string;
}

interface SubjectProgress {
  subject: string;
  progress: number;
  sessions: number;
  avgScore: number;
}

const StudyAnalyticsDashboard: React.FC = () => {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'time' | 'performance' | 'engagement'>('time');
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [userSessions, setUserSessions] = useState<StudySession[]>([]);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userCompanions = await getUserCompanions(user.id);
        
        if (!userCompanions || userCompanions.length === 0) {
          setUserSessions([]);
          setSubjects([]);
          setLoading(false);
          return;
        }
        
        // Transform companion data to match expected session structure
        const now = new Date();
        const sessionData: StudySession[] = [];
        
        // Create 1-3 sessions per companion with different dates
        userCompanions.forEach((companion: any) => {
          const sessionsCount = Math.floor(Math.random() * 3) + 1; // 1-3 sessions per companion
          
          for (let i = 0; i < sessionsCount; i++) {
            // Create date within the last month
            const sessionDate = new Date();
            sessionDate.setDate(now.getDate() - Math.floor(Math.random() * 30));
            
            // Generate unique ID using timestamp and random string
            const uniqueId = `${companion.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            
            sessionData.push({
              id: uniqueId,
              date: sessionDate.toISOString(),
              subject: companion.subject || 'General',
              duration: companion.duration || Math.floor(Math.random() * 30) + 15, // 15-45 minutes
              score: Math.floor(Math.random() * 20) + 80, // 80-100 score
              companion: companion.name || 'AI Companion',
              topics: companion.topic ? [companion.topic] : ['Learning']
            });
          }
        });

        // Sort sessions by date (newest first)
        sessionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const uniqueSubjects = [...new Set(sessionData.map(session => session.subject))];
        const subjectProgressData = uniqueSubjects.map(subject => {
          const filteredSessions = sessionData.filter(session => session.subject === subject);
          const totalSessions = filteredSessions.length;
          const totalPossibleSessions = sessionData.length;
          
          return {
            subject,
            progress: Math.min(Math.round((totalSessions / Math.max(totalPossibleSessions, 1)) * 100), 100),
            sessions: totalSessions,
            avgScore: filteredSessions.length > 0 ? 
              Math.round(filteredSessions.reduce((acc, cur) => acc + cur.score, 0) / filteredSessions.length) : 0
          };
        });

        setUserSessions(sessionData);
        setSubjects(subjectProgressData);
        generateInsights(sessionData, subjectProgressData);
      } catch (error) {
        console.error("Error fetching user data", error);
        setUserSessions([]);
        setSubjects([]);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const computeWeeklyData = () => {
    const defaultData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
      day,
      time: 0,
      performance: 0,
      engagement: 0
    }));
    
    if (!userSessions || userSessions.length === 0) {
      return defaultData;
    }
    
    try {
      const dataMap = new Map(defaultData.map(item => [item.day, { ...item }]));
      
      userSessions.forEach(session => {
        try {
          const sessionDate = new Date(session.date);
          if (isNaN(sessionDate.getTime())) return;
          
          const day = sessionDate.toLocaleString('en-US', { weekday: 'short' });
          const data = dataMap.get(day);
          if (!data) return;
          
          data.time += session.duration || 0;
          data.performance += session.score || 0;
          data.engagement += session.topics?.length || 0;
        } catch (error) {
          console.error("Error processing session:", error);
        }
      });
      
      return Array.from(dataMap.values()).map(data => ({
        ...data,
        performance: subjects.length > 0 ? Math.round(data.performance / subjects.length) : 0,
        engagement: userSessions.length > 0 ? Math.round(data.engagement / userSessions.length) : 0
      }));
    } catch (error) {
      console.error("Error processing weekly data:", error);
      return defaultData;
    }
  };

  const weeklyData = computeWeeklyData();

  const achievementStats = {
    totalHours: Math.floor(userSessions.reduce((acc, session) => acc + (session.duration || 0), 0) / 60),
    completedSessions: userSessions.length,
    averageScore: userSessions.length > 0 
      ? Math.round(userSessions.reduce((acc, session) => acc + (session.score || 0), 0) / userSessions.length)
      : 0,
    improvementRate: subjects.length > 0
      ? Math.round(subjects.reduce((acc, subject) => acc + (subject.progress || 0), 0) / subjects.length)
      : 0
  };

  const learningStreaks = {
    current: userSessions.reduce((streak, session) => {
      try {
        const sessionDate = new Date(session.date);
        if (isNaN(sessionDate.getTime())) return streak;
        
        const today = new Date();
        const diffInDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays <= 1 ? streak + 1 : 0;
      } catch (error) {
        return streak;
      }
    }, 0),
    longest: 7,
    thisWeek: userSessions.filter(session => {
      try {
        const sessionDate = new Date(session.date);
        if (isNaN(sessionDate.getTime())) return false;
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate > weekAgo;
      } catch (error) {
        return false;
      }
    }).length,
    thisMonth: userSessions.filter(session => {
      try {
        const sessionDate = new Date(session.date);
        if (isNaN(sessionDate.getTime())) return false;
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return sessionDate > monthAgo;
      } catch (error) {
        return false;
      }
    }).length
  };

  const generateInsights = (sessionsData = userSessions, subjectsData = subjects) => {
    try {
      if (!subjectsData.length || !sessionsData.length) {
        setInsights([{
          type: 'recommendation',
          title: 'Start Learning',
          description: 'Create a companion to begin tracking your progress',
          icon: '🚀',
          actionable: 'Create your first AI companion'
        }]);
        return;
      }

      const sortedByScore = [...subjectsData].sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0));
      const sortedByProgress = [...subjectsData].sort((a, b) => (a.progress || 0) - (b.progress || 0));
      
      const topSubject = sortedByScore[0] || { subject: 'your studies', avgScore: 0 };
      const weakestSubject = sortedByProgress[0] || { subject: 'some areas', progress: 0 };
      
      setInsights([
        {
          type: 'strength',
          title: 'Top Performance',
          description: `Excelling in ${topSubject.subject} with ${topSubject.avgScore}% average`,
          icon: '🌟',
          actionable: `Try advanced ${topSubject.subject} topics`
        },
        {
          type: 'improvement',
          title: 'Focus Area',
          description: `${weakestSubject.subject} needs attention (${weakestSubject.progress}% progress)`,
          icon: '📚',
          actionable: `Schedule focused ${weakestSubject.subject} sessions`
        },
        {
          type: 'trend',
          title: 'Learning Progress',
          description: `Completed ${sessionsData.length} sessions with consistent improvement`,
          icon: '📈'
        },
        {
          type: 'recommendation',
          title: 'Consistency',
          description: 'Regular study sessions improve retention',
          icon: '⚡',
          actionable: 'Set daily reminders'
        }
      ]);
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights([]);
    }
  };

  useEffect(() => {
    if (userSessions.length && subjects.length) {
      generateInsights();
    }
  }, [timeframe, userSessions, subjects]);

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-green-50 border-green-200 text-green-800';
      case 'improvement': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'trend': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'recommendation': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <div className="bg-white rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 h-64 animate-pulse"></div>
          <div className="bg-white rounded-xl p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Learning Analytics</h2>
              <p className="text-gray-600">Track your progress and insights</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'year'].map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period as any)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  timeframe === period ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <Clock className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{Math.floor(achievementStats.totalHours)}h</div>
            <div className="text-sm">Total Study Time</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
            <Target className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{achievementStats.averageScore}%</div>
            <div className="text-sm">Average Score</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <Zap className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">{learningStreaks.current}</div>
            <div className="text-sm">Day Streak</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <TrendingUp className="w-6 h-6 mb-2" />
            <div className="text-2xl font-bold">+{achievementStats.improvementRate}%</div>
            <div className="text-sm">Improvement</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold">Weekly Performance</h3>
            <div className="flex gap-1">
              {['time', 'performance', 'engagement'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric as any)}
                  className={`px-3 py-1 rounded text-xs ${
                    selectedMetric === metric ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2">
            {weeklyData.map(day => {
              const value = day[selectedMetric] || 0;
              const maxValue = Math.max(...weeklyData.map(d => d[selectedMetric] || 0), 1);
              const height = (value / maxValue) * 100;
              
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t relative group">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100">
                      {selectedMetric === 'time' ? formatTime(value) : `${value}%`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">{day.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Progress */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold mb-6">Subject Progress</h3>
          <div className="space-y-4">
            {subjects.length > 0 ? subjects.map(subject => (
              <div key={subject.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{subject.subject}</span>
                  <div className="text-sm text-gray-600">
                    {subject.progress}% • {subject.sessions} sessions
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Avg Score: {subject.avgScore}%</span>
                  <span>{100 - subject.progress}% remaining</span>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-10">
                No subjects available. Create a companion to start tracking.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div
              key={`insight-${index}`}
              className={`border-2 rounded-lg p-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm mb-2">{insight.description}</p>
                  {insight.actionable && (
                    <div className="bg-white bg-opacity-50 rounded px-2 py-1 text-xs">
                      💡 {insight.actionable}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Streaks & Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-6 h-6 text-orange-500" />
            <h3 className="text-lg font-semibold">Learning Streaks</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{learningStreaks.current}</div>
              <div className="text-sm text-gray-600">Current Streak</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{learningStreaks.longest}</div>
              <div className="text-sm text-gray-600">Longest Streak</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{learningStreaks.thisWeek}</div>
              <div className="text-sm text-gray-600">This Week</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{learningStreaks.thisMonth}</div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-yellow-500" />
            <h3 className="text-lg font-semibold">Recent Achievements</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { title: 'Speed Learner', desc: 'Completed 5 sessions in one day', icon: '⚡' },
              { title: 'Consistency King', desc: 'Maintained 7-day learning streak', icon: '👑' },
              { title: 'Knowledge Seeker', desc: 'Explored 3 new subjects', icon: '🔍' }
            ].map((achievement, index) => (
              <div key={`achievement-${index}`} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <div className="font-medium text-yellow-800">{achievement.title}</div>
                  <div className="text-sm text-yellow-600">{achievement.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyAnalyticsDashboard;