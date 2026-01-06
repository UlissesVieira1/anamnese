import db from '../db';

export default class Model {
  protected tabela: string;

  constructor(tabela: string) {
    this.tabela = tabela;
  }

  /**
   * Insere dados na tabela
   * @param dados Objeto com os campos e valores a serem inseridos
   * @returns Promise com o resultado da inserção
   */
  async insert(dados: Record<string, any>): Promise<any> {
    const campos = Object.keys(dados); // pega os campos do objeto
    
    // Converte objetos e arrays aninhados para JSON strings
    // Mantém Date como está (será convertido automaticamente para datetime pelo MySQL)
    const valores = Object.values(dados).map(valor => {
      if (valor instanceof Date) {
        return valor; // Date é mantido como está para campos datetime
      }
      if (typeof valor === 'object' && valor !== null) {
        return JSON.stringify(valor); // converte objetos aninhados para JSON string
      }
      return valor; // mantém valores primitivos como estão
    });
    
    const placeholders = campos.map(() => '?').join(', '); // cria os placeholders para a query

    const query = `INSERT INTO ${this.tabela} (${campos.join(', ')}) VALUES (${placeholders})`; // cria a query para inserir os dados na tabela
    
    const [result] = await db.query(query, valores);
    return result;
  }

  /**
   * Busca todos os registros da tabela
   * @param condicoes Opcional: objeto com condições WHERE
   * @returns Promise com os registros encontrados
   */
  async findAll(condicoes?: Record<string, any>): Promise<any[]> {
    let query = `SELECT * FROM ${this.tabela}`;
    const valores: any[] = [];

    if (condicoes && Object.keys(condicoes).length > 0) {
      const whereClause = Object.keys(condicoes)
        .map(campo => `${campo} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      valores.push(...Object.values(condicoes));
    }

    const [rows] = await db.query(query, valores);
    return rows as any[];
  }

  /**
   * Busca um registro por ID
   * @param id ID do registro
   * @returns Promise com o registro encontrado ou null
   */
  async findById(id: number | string): Promise<any | null> {
    const [rows] = await db.query(
      `SELECT * FROM ${this.tabela} WHERE id = ?`,
      [id]
    );
    const resultado = rows as any[];
    return resultado.length > 0 ? resultado[0] : null;
  }

  /**
   * Atualiza registros na tabela
   * @param dados Objeto com os campos e valores a serem atualizados
   * @param condicoes Objeto com condições WHERE
   * @returns Promise com o resultado da atualização
   */
  async update(dados: Record<string, any>, condicoes: Record<string, any>): Promise<any> {
    const campos = Object.keys(dados).map(campo => `${campo} = ?`).join(', ');
    const valores = Object.values(dados);
    
    const whereClause = Object.keys(condicoes)
      .map(campo => `${campo} = ?`)
      .join(' AND ');
    valores.push(...Object.values(condicoes));

    const query = `UPDATE ${this.tabela} SET ${campos} WHERE ${whereClause}`;
    
    const [result] = await db.query(query, valores);
    return result;
  }

  /**
   * Deleta registros da tabela
   * @param condicoes Objeto com condições WHERE
   * @returns Promise com o resultado da deleção
   */
  async delete(condicoes: Record<string, any>): Promise<any> {
    const whereClause = Object.keys(condicoes)
      .map(campo => `${campo} = ?`)
      .join(' AND ');
    const valores = Object.values(condicoes);

    const query = `DELETE FROM ${this.tabela} WHERE ${whereClause}`;
    
    const [result] = await db.query(query, valores);
    return result;
  }
}
