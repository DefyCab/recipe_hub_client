import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  styled,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  TextField,
  Box,
  Avatar
} from "@mui/material";
import Recipes from "../modules/Recipes";
import IngredientsList from "./IngredientsList";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import Comments from "../modules/Comments";

const Img = styled("img")({
  margin: "auto",
  display: "block",
  maxWidth: "100%",
  maxHeight: "100%"
});

const RecipeFullView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state);
  const [recipe, setRecipe] = useState({});
  const [showEditDelete, setShowEditDelete] = useState(false);
  const [message, setMessage] = useState();
  const [comment, setComment] = useState();
  const [commentsList, setCommentsList] = useState([]);

  const fetchRecipe = async () => {
    const data = await Recipes.show(id);
    if (data.recipe) {
      currentUser?.uid === data.recipe?.owner && setShowEditDelete(true);
      setRecipe(data.recipe);
      setCommentsList(data.recipe.comments);
    }
  };

  const commentsFeed = commentsList.map((comment, index) => {
    comment.index = index + 1;
    return (
      <Grid item xs={12} key={comment.index}>
        <Typography
          data-cy={`comment-user-${comment.index}`}
          variant="h6"
          gutterBottom
          component="div"
        >
          {comment.user}
        </Typography>
        <Typography
          data-cy={`comment-body-${comment.index}`}
          variant="body1"
          gutterBottom
          component="div"
        >
          {comment.body}
        </Typography>
      </Grid>
    );
  });

  const createComment = async (event) => {
    const response = await Comments.create(id, comment);
    if (response.comment) {
      let newComment = { user: currentUser.name, body: response.comment?.body }
      setCommentsList([newComment, ...commentsList]);
    }
  };

  const handleChange = (event) => {
    setComment({
      ...comment,
      [event.target.name]: event.target.value
    });
  };

  const deleteRecipe = async () => {
    const data = await Recipes.delete(id);
    setMessage(data.message);
    if (data.message === "Your Recipe has been deleted!") {
      setTimeout(() => navigate("/my-recipes"), 2000);
    }
  };

  const confirmDelete = (confirm) => {
    confirm.stopPropagation();
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      deleteRecipe();
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, []);

  return (
    <React.Fragment>
      {message && (
        <Alert data-cy="flash-message" severity="info">
          {message}
        </Alert>
      )}
      <Paper
        sx={{ p: 2, margin: "auto", maxWidth: 800, flexGrow: 1, boxShadow: 3 }}
      >
        {showEditDelete && (
          <React.Fragment>
            <Button
              data-cy="edit-recipe-btn"
              onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
              variant="contained"
              color="success"
              size="small"
              startIcon={<EditIcon />}
              sx={{
                marginRight: "10px",
                marginBottom: "10px"
              }}
            >
              Edit
            </Button>
            <Button
              data-cy="delete-btn"
              onClick={confirmDelete}
              color="error"
              size="small"
              variant="contained"
              startIcon={<DeleteIcon />}
              sx={{ marginBottom: "10px" }}
            >
              Delete
            </Button>
          </React.Fragment>
        )}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography gutterBottom variant="h4" data-cy="recipe-name">
              {recipe.name}
            </Typography>
            <IngredientsList ingredients={recipe.ingredients} />
          </Grid>
          <Grid item xs={6}>
            <Img
              src="https://mui.com/static/images/cards/paella.jpg"
              loading="lazy"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography
              gutterBottom
              variant="body1"
              data-cy="recipe-instructions"
            >
              {recipe.instructions}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography
              data-cy="recipe-created_at"
              variant="caption"
              display="block"
              gutterBottom
            >
              {recipe.created_at}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Box
        component="form"
        sx={{ p: 2, margin: "auto", maxWidth: 800, flexGrow: 1, boxShadow: 3 }}
        noValidate
        autoComplete="off"
      >
        {currentUser && (
          <React.Fragment>
            <TextField
              data-cy="comment-field"
              name="comment"
              size="normal"
              variant="outlined"
              fullWidth
              multiline
              placeholder="Leave your comment here ..."
              onChange={handleChange}
            />
            <Button onClick={createComment} data-cy="post-comment-btn">
              Post comment
            </Button>
          </React.Fragment>
        )}
        <Paper style={{ padding: "40px 20px" }}>
          <Grid container data-cy="comment-feed" spacing={2}>
            {commentsFeed}
          </Grid>
        </Paper>
      </Box>
    </React.Fragment>
  );
};

export default RecipeFullView;
