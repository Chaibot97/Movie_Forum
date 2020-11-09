import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { withNavigation } from 'react-navigation';

const MovieCard = ({movie, closeDetail}) => {
  const { backdropPath, title, director, actors, rating, genres, language } = movie;

  const imagePath = `https://image.tmdb.org/t/p/original${backdropPath}`;
  return (
    <View style={styles.cardContainer}>
      <View>
        <Button 
          onPress={closeDetail}
          title="Go Back"
        />
      </View>
      <View style={{marginTop: 20}}>
        <Image source={{uri: imagePath}} style={{height: 400, width: 800, resizeMode: 'cover'}}/>
      </View>
      <View style={{paddingLeft: 20, paddingVertical: 10}}>
        <Text style={{fontWeight: 'bold', fontSize: 18, color: 'white'}}>{title}</Text>
        <Text style={{color: '#'}}>{language}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
    height: '100%'
  }
})

export default withNavigation(MovieCard);