use crate::error::AppError;
use crate::instruction::AppInstruction;
use crate::schema::dodo::Memo;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_pack::Pack,
    pubkey::Pubkey,
};

pub struct Processor {}

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = AppInstruction::unpack(instruction_data)?;
        match instruction {
            AppInstruction::CreateMemo {
                index,
                memo,
                completed,
            } => {
                let accounts_iter = &mut accounts.iter();
                let account = next_account_info(accounts_iter)?;
                if account.owner != program_id {
                    return Err(AppError::IncorrectProgramId.into());
                }

                let mut data = Memo::unpack(&account.data.borrow())?;
                data.index = index;
                data.memo = memo;
                data.completed = completed;

                Memo::pack(data, &mut account.data.borrow_mut())?;

                Ok(())
            }
        }
    }
}
