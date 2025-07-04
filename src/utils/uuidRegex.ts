import { BadRequestException } from '@nestjs/common';

export function uuidRegex(id: string) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error(`le id invalide: ${id}`);
    throw new BadRequestException(
      "L'identifiant de l'utilisateur doit être un UUID valide",
    );
  }
}
