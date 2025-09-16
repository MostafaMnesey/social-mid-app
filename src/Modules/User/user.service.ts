import type { Response, Request } from "express";
import { createLoginTokens, revokeToken } from "../../utils/security/token";
import { HydUserDoc } from "../../DB/models/user";
import type { JwtPayload } from "jsonwebtoken";

class UserService {
  constructor() {}

  profile = async (req: Request, res: Response): Promise<Response> => {
    return res.status(200).json({
      user: req?.user,
      decoded: req.decoded,
    });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const credentials = await createLoginTokens(req?.user as HydUserDoc);
    await revokeToken(req.decoded as JwtPayload);
    return res.status(200).json({ credentials });
  };
}

export default new UserService();
