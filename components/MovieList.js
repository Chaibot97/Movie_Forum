import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Image } from 'react-native';

const MovieList = ({ movies, onMovieSelected, isHorizontal}) => {

  // function to render single movie 
  const renderMovieVertical = (movie, isHorizontal) => {
    // extract the detail information
    const { imageUri, homepage, title, director, actors, rating, genres, language } = movie;

    // build image path
    // let imagePath = `https://image.tmdb.org/t/p/original${imageUri}`;
    const imagePath = 'https://image.tmdb.org/t/p/original/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg';

    // render the movie
    return (
      <View style={[styles.movieCard]}>
        <TouchableOpacity onPress={() => onMovieSelected(movie)}>
          <Image source={{uri: imagePath}} style={{height: 450, width: 300, resizeMode: 'cover'}}/>
        </TouchableOpacity>
        <View style={{paddingLeft: 20, paddingVertical: 10}}>
          <Text style={{fontWeight: 'bold', fontSize: 18, color: '#37a9b8'}}>{title}</Text>
          <Text style={{color: '#37a9b8'}}>language: {language}</Text>
        </View>
      </View>
    )
  }

  const renderMovieHorizontal = (movie, isHorizontal) => {
    // extract the detail information
    const { imageUri, homepage, title, director, actors, rating, genres, language } = movie;

    // build image path
    // let imagePath = `https://image.tmdb.org/t/p/original${imageUri}`;
    const imagePath = 'https://image.tmdb.org/t/p/original/7G9915LfUQ2lVfwMEEhDsn3kT4B.jpg';

    // render the movie
    return (
      <View style={[styles.movieCard, {flexDirection: 'row'}]}>
        <TouchableOpacity onPress={() => onMovieSelected(movie)}>
          <Image source={{uri: imagePath}} style={{height: 450, width: 300, resizeMode: 'cover'}}/>
        </TouchableOpacity>
        <View style={{paddingLeft: 20, paddingVertical: 10}}>
          <Text style={{fontWeight: 'bold', fontSize: 18, color: '#37a9b8'}}>{title}</Text>
          <Text style={{color: '#37a9b8'}}>language: {language}</Text>
        </View>
      </View>
    )
  }

  // render the flatList
  return (
    <ScrollView style={{flex: 1, backgroundColor: 'black'}}>
      <FlatList
        horizontal={isHorizontal}
        data={movies}
        renderItem={({item}) => isHorizontal ? renderMovieVertical(item) : renderMovieHorizontal(item)}
        keyExtractor={item => item.id}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  movieCard: {
    padding: 20,
  }
});

export default MovieList;

