import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MovieCard = ({movie, onMovieSelected}) => {
  const { imageUri, homepage, title, director, actors, rating, genres, language } = movie;

  const imagePath = `https://image.tmdb.org/t/p/original${imageUri}`;
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={() => onMovieSelected(movie)}>
        <Image source={{uri: imagePath}} style={{height: 450, width: 300, resizeMode: 'cover'}}/>
      </TouchableOpacity>
      <View style={{paddingLeft: 20, paddingVertical: 10}}>
        <Text style={{fontWeight: 'bold', fontSize: 18, color: 'white'}}>{title}</Text>
        <Text style={{color: '#'}}>{language}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    padding: 20,
    width: '100%'
  }
})

export default MovieCard;