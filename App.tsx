import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, } from 'react-native';

interface Card {
  id: number;
  type: 'plastic' | 'paper' | 'glass' | 'contaminant';
  revealed: boolean;
  matched: boolean;
}

interface ScoreEntry {
  score: number;
  time: string;
}

const generateRandomCards = () => {
  const cardTypes: Card['type'][] = ['plastic', 'paper', 'glass', 'plastic', 'paper', 'glass', 'contaminant'];
  const cards = cardTypes.concat(cardTypes)
    .sort(() => 0.5 - Math.random())
    .map((type, index) => ({ id: index, type, revealed: false, matched: false }));
  return cards;
};

const App = () => {
  const [screen, setScreen] = useState<'home' | 'game' | 'result' | 'leaderboard'>('home');
  const [cards, setCards] = useState<Card[]>(generateRandomCards());
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 seconds game timer
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [isRushMode, setIsRushMode] = useState<boolean>(false);

  useEffect(() => {
    if (screen === 'game' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        if (timeLeft < 20) setIsRushMode(true); // Activate Rush Mode in the last 20 seconds
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, screen]);

  const resetGame = () => {
    setCards(generateRandomCards());
    setSelectedCards([]);
    setScore(0);
    setTimeLeft(60);
    setIsRushMode(false);
  };

  const startGame = () => {
    resetGame();
    setScreen('game');
  };

  const handleCardPress = (index: number) => {
    const newCards = [...cards];
    if (newCards[index].revealed || newCards[index].matched) return;

    newCards[index].revealed = true;
    setSelectedCards(prev => {
      const updated = [...prev, index];
      if (updated.length === 2) {
        const [firstIndex, secondIndex] = updated;
        if (newCards[firstIndex].type === newCards[secondIndex].type && newCards[firstIndex].type !== 'contaminant') {
          newCards[firstIndex].matched = true;
          newCards[secondIndex].matched = true;
          setScore(score + 10);
        } else if (newCards[firstIndex].type === 'contaminant' || newCards[secondIndex].type === 'contaminant') {
          setScore(score - 5);
        }
        setTimeout(() => setSelectedCards([]), 500);
      }
      setCards(newCards);
      return updated.length === 2 ? [] : updated;
    });
  };

  const endGame = () => {
    const currentTime = new Date();
    const timeString = `${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`;
    setLeaderboard([...leaderboard, { score, time: timeString }]);
    setScreen('result');
  };

  const renderCard = ({ item, index }: { item: Card, index: number }) => (
    <TouchableOpacity
      style={[styles.card, item.revealed || item.matched ? styles.revealed : null, isRushMode ? styles.rushMode : null]}
      onPress={() => handleCardPress(index)}
      disabled={item.revealed || item.matched}
    >
      <Text style={styles.cardText}>{item.revealed || item.matched ? item.type : '?'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {screen === 'home' && (
        <>
          <Text style={styles.title}>Recycling Challenge</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Start Recycling</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('leaderboard')}>
            <Text style={styles.buttonText}>View Leaderboard</Text>
          </TouchableOpacity>
        </>
      )}

      {screen === 'game' && (
        <>
          <Text style={styles.title}>Recycling Bin - Time Left: {timeLeft}s</Text>
          <FlatList
            data={cards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={4}
          />
          <Text style={styles.score}>Recycling Points: {score}</Text>
        </>
      )}

      {screen === 'result' && (
        <>
          <Text style={styles.title}>Recycling Complete!</Text>
          <Text style={styles.score}>Final Score: {score}</Text>
          <TouchableOpacity style={styles.button} onPress={startGame}>
            <Text style={styles.buttonText}>Recycle More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('leaderboard')}>
            <Text style={styles.buttonText}>View Leaderboard</Text>
          </TouchableOpacity>
        </>
      )}

      {screen === 'leaderboard' && (
        <>
          <Text style={styles.title}>Leaderboard</Text>
          {leaderboard.map((entry, index) => (
            <Text key={index} style={styles.leaderboardEntry}>
              {index + 1}. Score: {entry.score} - Time: {entry.time}
            </Text>
          ))}
          <TouchableOpacity style={styles.button} onPress={() => setScreen('home')}>
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    width: 70,
    height: 70,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#87ceeb',
    borderRadius: 8,
  },
  revealed: {
    backgroundColor: '#fff',
  },
  rushMode: {
    backgroundColor: '#ffa07a',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  leaderboardEntry: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default App;
