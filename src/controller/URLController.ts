import { config } from "config/Constants";
import { URLModel } from "database/model/URL";
import { Request, response, Response } from "express";
import shortid from "shortid";

export class URLController {
  public async shorten(req: Request, res: Response): Promise<void> {
    // * Ver se URL existe
    const { originURL } = req.body;
    const url = await URLModel.findOne({ originURL });
    if (url) {
      response.json(url);
      return;
    }

    // * Criar hash para essa URL
    const hash = shortid.generate();
    const shortURL = `${config.API_URL}/${hash}`;

    // * Salvar a URL no banco de dados
    const newURL = await URLModel.create({ hash, shortURL, originURL });
    if (newURL) {
      response.json(newURL);
      return;
    }
    // * Retornar a URL salva
    response.json({ originURL, hash, shortURL });
  }

  public async redirect(req: Request, res: Response): Promise<void> {
    // * Pegar hash da URL
    const { hash } = req.params;
    // * Encontrar URL original pelo hash
    const url = await URLModel.findOne({ hash });

    if (url) {
      response.redirect(url.originURL);
      return;
    }

    response.status(400).json({ error: "URL not found" });
    // * Redirecionar a URL original a partir do banco de dados
  }
}
