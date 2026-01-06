import { Router, Request, Response } from 'express';
import FichaAnamnese from './models/FichaAnamnese';
import { log } from 'node:console';

const router = Router(); // instancia o router

/**
 * Mapeia os dados do formulário para a estrutura do banco de dados
 * @param dadosFormulario Dados recebidos do frontend
 * @returns Dados formatados para inserção no banco
 */
function mapearDadosParaBanco(dadosFormulario: any) {
    // Agrupa dados do cliente no campo JSON dados_cliente
    const dadosCliente = {
        endereco: dadosFormulario.endereco || '',
        rg: dadosFormulario.rg || '',
        dataNascimento: dadosFormulario.dataNascimento || '',
        idade: dadosFormulario.idade || '',
        comoNosConheceu: dadosFormulario.comoNosConheceu || {},
        telefone: dadosFormulario.telefone || '',
        celular: dadosFormulario.celular || '',
        email: dadosFormulario.email || '',
    };

    // Agrupa avaliação médica no campo JSON avaliacao
    const avaliacao = {
        avaliacaoMedica: dadosFormulario.avaliacaoMedica || {},
        outrasQuestoesMedicas: dadosFormulario.outrasQuestoesMedicas || {},
        outroProblema: dadosFormulario.outroProblema || '',
        tipoSanguineo: dadosFormulario.tipoSanguineo || '',
    };

    // Determina o campo termos (char(2))
    // Se aceitou termos e todas as declarações estão marcadas, retorna "SI", senão "NO"
    let termos = 'N';
    if (dadosFormulario.aceiteTermos && dadosFormulario.declaracoes) {
        const todasDeclaracoes = Object.values(dadosFormulario.declaracoes).every((valor: any) => valor === true);
        if (todasDeclaracoes) {
            termos = 'S';
        }
    }

    // Agrupa informações da tatuagem no campo JSON info_tattoo
    const infoTattoo = {
        procedimento: dadosFormulario.procedimento || {},
        declaracoes: dadosFormulario.declaracoes || {},
    };

    // Retorna dados formatados para a estrutura do banco
    return {
        nome: dadosFormulario.nome,
        cpf: dadosFormulario.cpf,
        dados_cliente: dadosCliente,
        avaliacao: avaliacao,
        termos: termos,
        data_preenchimento_ficha: new Date(), // data/hora atual
        info_tattoo: infoTattoo,
    };
}

router.post('/inserirDadosAnamnese', async (req: Request, res: Response) => { // rota para inserir dados da anamnese
    try {
        
        const dadosFormulario = req.body; // pega todos os dados do body

        // Validação básica - verifica se nome e cpf foram enviados
        if (!dadosFormulario.nome || !dadosFormulario.cpf) {
            return res.status(400).json({
                success: false,
                message: 'Nome e CPF são obrigatórios'
            });
        }

        // Mapeia os dados do formulário para a estrutura do banco
        const dadosBanco = mapearDadosParaBanco(dadosFormulario);

        const fichaAnamnese = new FichaAnamnese(); // instancia o modelo (a tabela já está definida no constructor)

        // Insere os dados mapeados no banco
        await fichaAnamnese.insert(dadosBanco);

        return res.json({
            success: true,
            message: 'Ficha de anamnese salva com sucesso!'
        }); // retorna sucesso no formato que o frontend espera
    } catch (error) {
        console.error('Erro ao salvar anamnese:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao salvar a ficha. Tente novamente.'
        });
    }
});

router.get('/', async (req: Request, res: Response) => {
    try {
        console.log('testeeee');
    } catch (error) {
        console.error('Erro ao buscar anamneses:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao buscar anamneses.'
        });
    }
});
     
    


export default router;
