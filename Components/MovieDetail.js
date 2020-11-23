import React, { Component } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, Button, FlatList, TextInput } from 'react-native';
import { withNavigation } from 'react-navigation';

import { getCommentsByMovieId, postComment } from '../api/dbo';

class MovieCard extends Component {
  constructor(props) {
    super(props);

    const { movie, onClose } = this.props;

    this.state = {
      comments: [],
      isLoading: false,
      newComment: ''
    }
  };

  componentDidMount() {
    this.fetchMovieComments();
  };

  fetchMovieComments = async () => {
    const { movie } = this.props;
    const { id } = movie;

    this.setState({ isLoading: true });
    const comments = await getCommentsByMovieId(id);
    this.setState({ comments, isLoading: false });
    console.log(comments);
  }

  renderMovieComment = (item) => {
    const { email, comment } = item;
    return (
      <View style={{ marginVertical: 15 }}>
        <Text style={{color: '#37a9b8'}}>{email}</Text>
        <Text style={{color: 'white'}}>{comment}</Text>
      </View>
    )
  };

  renderMovieComments = () => {
    const { comments, newComment} = this.state;
    return (
      <View style={{ marginVertical: 15}}>
        <View>
          <Text style={{color: 'white', fontSize: 24}}>Comments</Text>
        </View>
        <FlatList
          data={comments}
          renderItem={({item}) => this.renderMovieComment(item)}
          keyExtractor={(item) => item.id}
        />
        <br/>
        <Text style={{color: 'white'}}>Enter your comments</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'white'}}
          onChangeText={text => this.setState({ newComment: text })}
          value={newComment}
        />
        <Button
          onPress={this.submitComment}
          title="Comment"
        />
      </View>
    )
  }

  submitComment = async () => {
    const { newComment, comments } = this.state;
    const { id } = this.props.movie;
    const nc = {id: comments.length+1, email: 'test', comment: newComment}
    console.log(comments);
    await postComment(id, null, newComment);
    this.setState({ isLoading: true, newComment: '', comments: [...comments,  nc]});
  }

  renderMovieDetail = () => {
    const { movie } = this.props;
    const { poster_url, title, language, overview, vote_avg,  vote_count } = movie;
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    return (
      <>
        <View style={{flexDirection: 'row', marginTop: 20, alignItems: 'flex-start',}}>
          <Image source={{uri: imagePath}} style={{height:600, width: 450, resizeMode: 'cover'}}/>
          <View style={{ width: '50%', marginHorizontal: 30 }}>
            <Text style={{fontWeight: 'bold', fontSize: 24, color: 'white'}}>{title}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Language: {language}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Vote Average: {vote_avg}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>Vote Count: {vote_count}</Text>
            <br/>
            <Text style={{color: '#37a9b8'}}>{overview}</Text>
          </View>
        </View>
        {this.renderMovieComments()}
      </>
    )
  };

  render() {
    const { movie, onClose } = this.props;
    const { poster_url, title, language, overview, vote_avg,  vote_count} = movie;
    const imagePath = `https://image.tmdb.org/t/p/original${poster_url}`;

    return (
      <View style={styles.container}>
        <View>
          <Button 
            onPress={onClose}
            title="Go Back"
          />
        </View>
        {this.renderMovieDetail()}
      </View>
    )
  }

};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    padding: 20,
    width: '100%',
    height: '100%'
  },
  movieDetail: {
    flexDirection: 'column'
  }
})

export default withNavigation(MovieCard);