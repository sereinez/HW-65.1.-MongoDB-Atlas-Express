import Article from '../models/articleModel.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Завантажує статтю з MongoDB за :articleId (разом з автором) у req.article або відповідає 404. */
export const loadArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.articleId).populate('author', 'username');
  if (!article) {
    return res.status(404).send('Статтю не знайдено.');
  }
  req.article = article;
  next();
});

/** Редагувати/видаляти статтю може лише її автор або адміністратор. */
export function canModifyArticle(req, res, next) {
  const isAuthor = req.article.author && req.article.author.id === req.user.id;
  if (req.user.role === 'admin' || isAuthor) return next();
  res.status(403).send('Доступ заборонено. Змінювати статтю може лише її автор або адміністратор.');
}
