import { useState } from 'react';

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  track: string;
  team: string;
  points: number;
  trackPoints: Record<string, number>;
  achievements: string[];
  status: 'approved' | 'pending';
}

interface AnalyticsProps {
  participants: Participant[];
  teams: { team1: string; team2: string };
  trackBranches: string[];
}

const Analytics = ({ participants, teams, trackBranches }: AnalyticsProps) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'participants'>('teams');

  // Colors for different categories
  const categoryColors: Record<string, string> = {
    'СИЛА': '#ef4444',      // red-500
    'КАРДИО': '#f97316',    // orange-500
    'БАЛАНС': '#3b82f6',    // blue-500
    'АЛЬТЕРНАТИВА': '#22c55e', // green-500
  };

  // Get team data for charts
  const getTeamsData = () => {
    const teamNames = [teams.team1, teams.team2];
    
    return teamNames.map(teamName => {
      const teamParticipants = participants.filter(p => p.team === teamName);
      const totalPoints = teamParticipants.reduce((sum, p) => sum + p.points, 0);
      const participantCount = teamParticipants.length;
      
      // Calculate points by category for this team
      const categoryPoints: Record<string, number> = {};
      trackBranches.forEach(branch => {
        categoryPoints[branch] = teamParticipants.reduce((sum, p) => sum + (p.trackPoints[branch] || 0), 0);
      });

      return {
        team: teamName,
        totalPoints,
        participantCount,
        ...categoryPoints
      };
    });
  };

  // Get participants data by category
  const getParticipantsByCategory = (category: string) => {
    return participants
      .map(p => ({
        name: `${p.firstName} ${p.lastName.charAt(0)}.`,
        fullName: `${p.firstName} ${p.lastName}`,
        points: p.trackPoints[category] || 0,
        team: p.team
      }))
      .filter(p => p.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10); // Top 10 participants
  };

  const teamsData = getTeamsData();

  // Helper function to create simple bar chart
  const createSimpleBarChart = (data: any[], maxValue: number, color: string) => {
    return data.map((item, index) => {
      const percentage = (item.value / maxValue) * 100;
      return (
        <div key={index} className="flex items-center gap-4 mb-3">
          <div className="w-24 text-xs text-gray-600 truncate" title={item.label}>
            {item.label}
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
            <div
              className="h-6 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
              style={{
                width: `${Math.max(percentage, 5)}%`,
                backgroundColor: color,
                background: `linear-gradient(90deg, ${color}, ${color}dd)`
              }}
            >
              <span className="text-xs text-white font-medium">
                {item.value}
              </span>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-3xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 uppercase text-center">
        📊 АНАЛИТИКА ЧЕЛЛЕНДЖА
      </h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-2xl p-2 flex">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-8 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
            }`}
          >
            👥 Команды
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-8 py-3 rounded-xl transition-all duration-300 ${
              activeTab === 'participants'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
            }`}
          >
            🏃 Участники
          </button>
        </div>
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-8">
          {/* Team Comparison Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🏆 Сравнение команд по общим баллам
            </h3>
            <div className="space-y-6">
              {/* Total Points Comparison */}
              <div>
                <h4 className="text-lg mb-4 text-center text-gray-700">📊 Общие баллы</h4>
                {(() => {
                  const maxPoints = Math.max(...teamsData.map(t => t.totalPoints));
                  const chartData = teamsData.map(team => ({
                    label: team.team,
                    value: team.totalPoints
                  }));
                  return (
                    <div className="bg-white p-4 rounded-xl">
                      {createSimpleBarChart(chartData, maxPoints, '#8b5cf6')}
                    </div>
                  );
                })()}
              </div>

              {/* Participant Count Comparison */}
              <div>
                <h4 className="text-lg mb-4 text-center text-gray-700">👥 Количество участников</h4>
                {(() => {
                  const maxParticipants = Math.max(...teamsData.map(t => t.participantCount));
                  const chartData = teamsData.map(team => ({
                    label: team.team,
                    value: team.participantCount
                  }));
                  return (
                    <div className="bg-white p-4 rounded-xl">
                      {createSimpleBarChart(chartData, maxParticipants, '#06b6d4')}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Category Breakdown Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📈 Детализация баллов по категориям
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamsData.map((teamData) => (
                <div key={teamData.team} className="bg-white p-6 rounded-xl border border-gray-200">
                  <h4 className="text-lg mb-4 text-center text-gray-800">
                    🏃 {teamData.team}
                  </h4>
                  <div className="space-y-3">
                    {trackBranches.map((branch) => {
                      const points = teamData[branch] || 0;
                      const maxCategoryPoints = Math.max(
                        ...teamsData.map(t => t[branch] || 0),
                        1 // Prevent division by zero
                      );
                      const percentage = (points / maxCategoryPoints) * 100;
                      
                      return (
                        <div key={branch} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-24">
                            <span className="text-sm">
                              {branch === 'СИЛА' && '💪'}
                              {branch === 'КАРДИО' && '❤️'}
                              {branch === 'БАЛАНС' && '🧘'}
                              {branch === 'АЛЬТЕРНАТИВА' && '🌟'}
                            </span>
                            <span className="text-xs text-gray-600 truncate">
                              {branch}
                            </span>
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
                            <div
                              className="h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.max(percentage, points > 0 ? 15 : 0)}%`,
                                backgroundColor: categoryColors[branch] || '#6b7280'
                              }}
                            >
                              {points > 0 && (
                                <span className="text-xs text-white font-medium">
                                  {points}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                    <span className="text-sm text-gray-600">
                      💯 Итого: <span className="font-medium text-purple-600">{teamData.totalPoints}</span> баллов
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trackBranches.map((category) => {
            const categoryData = getParticipantsByCategory(category);
            
            return (
              <div key={category} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg mb-4 text-center">
                  <span 
                    className="px-4 py-2 rounded-full text-white"
                    style={{ backgroundColor: categoryColors[category] || '#6b7280' }}
                  >
                    {category === 'СИЛА' && '💪'} 
                    {category === 'КАРДИО' && '❤️'} 
                    {category === 'БАЛАНС' && '🧘'} 
                    {category === 'АЛЬТЕРНАТИВА' && '🌟'} 
                    {category}
                  </span>
                </h3>
                
                <div className="bg-white p-4 rounded-xl min-h-64">
                  {categoryData.length > 0 ? (
                    <div className="space-y-3">
                      {categoryData.map((participant, index) => {
                        const maxPoints = Math.max(...categoryData.map(p => p.points));
                        const percentage = (participant.points / maxPoints) * 100;
                        
                        return (
                          <div key={participant.name} className="flex items-center gap-3 group hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <div className="flex items-center gap-2 w-20">
                              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center text-white font-medium ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                'bg-gray-300'
                              }`}>
                                {index + 1}
                              </span>
                              <span className="text-xs text-gray-600 truncate flex-1" title={participant.fullName}>
                                {participant.name}
                              </span>
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-5 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 group-hover:brightness-110"
                                style={{
                                  width: `${Math.max(percentage, 10)}%`,
                                  backgroundColor: categoryColors[category] || '#6b7280'
                                }}
                              >
                                <span className="text-xs text-white font-medium">
                                  {participant.points}
                                </span>
                              </div>
                            </div>
                            <div className="w-16 text-xs text-gray-500 text-center">
                              {participant.team}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm">Нет данных для {category}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top 3 participants */}
                {categoryData.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">🏅 ТОП-3:</h4>
                    <div className="space-y-1">
                      {categoryData.slice(0, 3).map((participant, index) => (
                        <div key={participant.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{participant.name}</span>
                          </div>
                          <span 
                            className="px-2 py-1 rounded-full text-white text-xs"
                            style={{ backgroundColor: categoryColors[category] || '#6b7280' }}
                          >
                            {participant.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 text-center">
          <div className="text-2xl bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            {participants.length}
          </div>
          <div className="text-sm text-purple-700">Участников</div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {participants.reduce((sum, p) => sum + p.points, 0)}
          </div>
          <div className="text-sm text-blue-700">Общих баллов</div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
            {Math.round(participants.reduce((sum, p) => sum + p.points, 0) / participants.length) || 0}
          </div>
          <div className="text-sm text-green-700">Средний балл</div>
        </div>
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            {participants.reduce((sum, p) => sum + p.achievements.length, 0)}
          </div>
          <div className="text-sm text-orange-700">Достижений</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;